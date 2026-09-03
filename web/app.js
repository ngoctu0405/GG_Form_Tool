const $ = (id) => document.getElementById(id);
const API_BASE = location.hostname === "localhost" && location.port === "3000"
  ? ""
  : "http://localhost:3000";

const DEFAULT_WEIGHTS = { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 };
const POSITIVE_WEIGHTS = { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 };
const BALANCED_WEIGHTS = { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 };
const WEIGHT_TYPES = [
  { key: "multipleChoice", icon: "◉", label: "Trắc nghiệm", description: "Một đáp án — ưu tiên theo mức 1–5" },
  { key: "dropdown", icon: "▾", label: "Danh sách thả xuống", description: "Chọn một mục theo tỷ lệ riêng" },
  { key: "linearScale", icon: "↔", label: "Phạm vi tuyến tính", description: "Thang điểm số từ thấp đến cao" },
  { key: "rating", icon: "★", label: "Xếp hạng", description: "Sao, tim hoặc biểu tượng đánh giá" },
  { key: "multipleChoiceGrid", icon: "▦", label: "Lưới trắc nghiệm", description: "Áp dụng độc lập cho từng hàng" },
];

let pollId;
let wasRunning = false;
let shownRunResult = null;

function hideErrorPanel() {
  $("errorPanel").hidden = true;
}

function showErrorPanel(result, fallbackLogs = []) {
  const logs = Array.isArray(result?.logs) && result.logs.length ? result.logs : fallbackLogs;
  $("errorSummary").textContent = result?.message || "Tool đã dừng do lỗi không xác định.";
  $("errorCode").textContent = result?.code == null ? "EXIT —" : `EXIT ${result.code}`;
  $("errorTime").textContent = result?.finishedAt
    ? `Kết thúc lúc ${new Date(result.finishedAt).toLocaleString("vi-VN")}`
    : "Lượt chạy vừa kết thúc";
  $("errorLogCount").textContent = `${logs.length} dòng`;

  const host = $("errorLogs");
  host.replaceChildren();
  (logs.length ? logs : ["Không có log bổ sung."]).forEach((line, index) => {
    const row = document.createElement("div");
    row.className = `error-log-row ${/lỗi|error|failed|timeout/i.test(line) ? "important" : ""}`;
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const content = document.createElement("code");
    content.textContent = line;
    row.append(number, content);
    host.append(row);
  });
  $("errorPanel").hidden = false;
}

function reportUiError(error, action) {
  const message = `${action}: ${error?.message || String(error)}`;
  setMessage(message, "error");
  showErrorPanel({
    success: false,
    code: error?.httpStatus ?? null,
    message,
    finishedAt: new Date().toISOString(),
    logs: error?.details ? [error.details] : [error?.stack || message],
  });
}

function renderWeightCards() {
  const host = $("weightTypes");
  const template = $("weightCardTemplate");

  for (const type of WEIGHT_TYPES) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.type = type.key;
    card.querySelector(".type-icon").textContent = type.icon;
    card.querySelector("h3").textContent = type.label;
    card.querySelector(".type-copy p").textContent = type.description;

    const inputs = card.querySelector(".weight-inputs");
    for (let score = 1; score <= 5; score++) {
      const field = document.createElement("div");
      field.className = "weight-input";
      field.innerHTML = `<label for="weight-${type.key}-${score}"><span>Mức</span><strong>${score}</strong></label><div class="weight-input-shell"><input id="weight-${type.key}-${score}" data-score="${score}" type="number" min="0" max="100" step="1" value="${DEFAULT_WEIGHTS[score]}" /><span>%</span></div>`;
      inputs.append(field);
    }

    card.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => updateWeightTotal(type.key)));
    card.querySelector(".mini-preset").addEventListener("click", () => setTypeWeights(type.key, BALANCED_WEIGHTS));
    host.append(card);
  }
}

function typeCard(type) {
  return document.querySelector(`.weight-card[data-type="${type}"]`);
}

function getTypeWeights(type) {
  const card = typeCard(type);
  return Object.fromEntries([...card.querySelectorAll("input[data-score]")].map((input) => [input.dataset.score, Number(input.value) || 0]));
}

function setTypeWeights(type, weights) {
  const card = typeCard(type);
  for (let score = 1; score <= 5; score++) card.querySelector(`[data-score="${score}"]`).value = weights?.[score] ?? DEFAULT_WEIGHTS[score];
  updateWeightTotal(type);
}

function updateWeightTotal(type) {
  const total = Object.values(getTypeWeights(type)).reduce((sum, value) => sum + value, 0);
  const label = typeCard(type).querySelector(".weight-total");
  label.textContent = `${total}%`;
  label.className = `weight-total ${total === 100 ? "valid" : "invalid"}`;
  return total;
}

function validateUrl(showState = true) {
  const url = $("formUrl").value.trim();
  const valid = /^https:\/\/(forms\.gle|docs\.google\.com)\//i.test(url);
  const state = $("urlState");
  if (showState) {
    state.textContent = !url ? "Chưa có link" : valid ? "Link hợp lệ" : "Link chưa đúng";
    state.className = `input-state ${!url ? "" : valid ? "valid" : "invalid"}`;
  }
  return valid;
}

function setMessage(message, type = "") {
  $("messageText").textContent = message;
  $("messageBox").className = `message-box ${type}`;
}

function updateBrowserState() {
  const enabled = $("showBrowser").checked;
  const state = $("browserState");
  state.textContent = enabled ? "Đang bật" : "Đang tắt";
  state.className = `toggle-state ${enabled ? "on" : "off"}`;
}

function configFromForm() {
  const formUrl = $("formUrl").value.trim();
  const total = Number($("total").value);
  const delaySeconds = Number($("delay").value);

  if (!validateUrl()) throw new Error("Hãy nhập đúng link Google Form.");
  if (!Number.isInteger(total) || total < 1) throw new Error("Số lượt gửi phải là số nguyên từ 1 trở lên.");
  if (!Number.isFinite(delaySeconds) || delaySeconds < 0) throw new Error("Thời gian nghỉ không được âm.");

  const typeWeights = Object.fromEntries(WEIGHT_TYPES.map(({ key, label }) => {
    if (updateWeightTotal(key) !== 100) throw new Error(`Tổng tỷ lệ của “${label}” phải bằng 100%.`);
    return [key, getTypeWeights(key)];
  }));

  return {
    FORM_URL: formUrl,
    TOTAL_SUBMISSIONS: total,
    DELAY_BETWEEN_SUBMISSIONS: Math.round(delaySeconds * 1000),
    HEADLESS: !$("showBrowser").checked,
    QUESTION_TYPE_WEIGHTS: typeWeights,
  };
}

async function api(url, options) {
  const method = options?.method || "GET";
  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, options);
  } catch (error) {
    throw new Error(`${method} ${API_BASE}${url}: không kết nối được server (${error.message}).`);
  }

  const rawBody = await response.text();
  let data = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch (error) {
    data = {};
  }

  if (!response.ok || data.success === false) {
    const detail = data.error || data.message || rawBody.trim() || response.statusText || "Không có nội dung phản hồi";
    const error = new Error(`${method} ${API_BASE}${url} — HTTP ${response.status}: ${detail}`);
    error.httpStatus = response.status;
    error.details = rawBody || detail;
    throw error;
  }
  return data;
}

async function saveConfig({ quiet = false } = {}) {
  const config = configFromForm();
  const data = await api("/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
  if (!quiet) setMessage(data.message || "Đã lưu cấu hình.", "success");
}

function setRunning(running) {
  const badge = $("statusBadge");
  badge.className = `status-badge ${running ? "running" : "stopped"}`;
  $("statusText").textContent = running ? "Đang chạy" : "Đã dừng";
  $("startButton").disabled = running;
  $("stopButton").disabled = !running;

  const controls = [$("formUrl"), $("total"), $("delay"), $("showBrowser"), $("positivePreset"), ...document.querySelectorAll(".weight-card input, .mini-preset")];
  controls.forEach((control) => { control.disabled = running; });
}

async function refreshStatus() {
  try {
    const status = await api("/status");
    setRunning(status.running);
    if (status.running) {
      hideErrorPanel();
      const latestLog = status.logs?.at(-1);
      setMessage(latestLog || "Tool đang mở và đọc cấu trúc biểu mẫu…", "success");
    } else if (status.lastRunResult && status.lastRunResult.message !== shownRunResult) {
      shownRunResult = status.lastRunResult.message;
      setMessage(status.lastRunResult.message, status.lastRunResult.success ? "success" : "error");
      if (!status.lastRunResult.success) showErrorPanel(status.lastRunResult, status.logs || []);
    }
    wasRunning = status.running;
  } catch {
    const badge = $("statusBadge");
    badge.className = "status-badge stopped";
    $("statusText").textContent = "Mất kết nối";
    $("startButton").disabled = true;
    $("stopButton").disabled = true;
    reportUiError(error, "Mất kết nối máy chủ");
  }
}

async function loadConfig() {
  const config = await api("/config");
  $("formUrl").value = config.FORM_URL || "";
  $("total").value = config.TOTAL_SUBMISSIONS ?? 1;
  $("delay").value = (config.DELAY_BETWEEN_SUBMISSIONS ?? 0) / 1000;
  $("showBrowser").checked = !Boolean(config.HEADLESS);
  updateBrowserState();

  const legacy = config.RATING_WEIGHTS || DEFAULT_WEIGHTS;
  for (const { key } of WEIGHT_TYPES) setTypeWeights(key, config.QUESTION_TYPE_WEIGHTS?.[key] || legacy);
  validateUrl();
}

renderWeightCards();

$("formUrl").addEventListener("input", () => validateUrl());
$("showBrowser").addEventListener("change", updateBrowserState);
$("positivePreset").addEventListener("click", () => {
  for (const { key } of WEIGHT_TYPES) setTypeWeights(key, POSITIVE_WEIGHTS);
  setMessage("Đã áp dụng tỷ lệ thiên tích cực cho tất cả dạng câu hỏi.", "success");
});
$("saveButton").addEventListener("click", async () => {
  try { await saveConfig(); } catch (error) { reportUiError(error, "Không lưu được cấu hình"); }
});
$("startButton").addEventListener("click", async () => {
  try {
    await saveConfig({ quiet: true });
    const data = await api("/start", { method: "POST" });
    setMessage(data.message || "Đã bắt đầu chạy.", "success");
    await refreshStatus();
  } catch (error) { reportUiError(error, "Không khởi động được tool"); }
});
$("stopButton").addEventListener("click", async () => {
  try {
    const data = await api("/stop", { method: "POST" });
    setMessage(data.message || "Đã dừng chương trình.", "warning");
    await refreshStatus();
  } catch (error) { reportUiError(error, "Không dừng được tool"); }
});
$("closeErrorButton").addEventListener("click", async () => {
  hideErrorPanel();
  shownRunResult = null;
  await api("/status/clear", { method: "POST" }).catch(() => {});
});
$("copyErrorButton").addEventListener("click", async () => {
  const details = [
    $("errorSummary").textContent,
    ...[...$("errorLogs").querySelectorAll("code")].map((element) => element.textContent),
  ].join("\n");
  try {
    await navigator.clipboard.writeText(details);
    $("copyErrorButton").textContent = "Đã chép";
    window.setTimeout(() => { $("copyErrorButton").textContent = "Sao chép"; }, 1500);
  } catch {
    setMessage("Không sao chép được log. Hãy bôi đen nội dung để sao chép thủ công.", "warning");
  }
});

document.addEventListener("keydown", async (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (!$("saveButton").disabled) $("saveButton").click();
  }
});

const observedSections = ["form-config", "type-weights", "run-control"];
const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
}, { rootMargin: "-20% 0px -65%", threshold: [0, .25, .5] });
observedSections.forEach((id) => observer.observe($(id)));

(async () => {
  try {
    await loadConfig();
    await refreshStatus();
    setMessage("Cấu hình đã tải. Tool sẽ tự đọc cấu trúc form khi chạy.", "success");
    pollId = window.setInterval(refreshStatus, 1500);
  } catch (error) { reportUiError(error, "Không tải được giao diện"); }
})();

window.addEventListener("beforeunload", () => window.clearInterval(pollId));
