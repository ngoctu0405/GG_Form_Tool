const $ = (id) => document.getElementById(id);

const controls = ["formUrl", "total", "delay", "headless", "rating1", "rating2", "rating3", "rating4", "rating5"];
let pollId;

function setMessage(message, type = "") {
  const box = $("messageBox");
  box.textContent = message;
  box.className = `message-box ${type}`;
}

function getWeights() {
  return Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, Number($(`rating${n}`).value) || 0]));
}

function updateWeightTotal() {
  const total = Object.values(getWeights()).reduce((sum, value) => sum + value, 0);
  const label = $("weightTotal");
  label.textContent = `Tổng: ${total}%`;
  label.className = `weight-total ${total === 100 ? "valid" : "invalid"}`;
  return total;
}

function configFromForm() {
  const formUrl = $("formUrl").value.trim();
  const total = Number($("total").value);
  const delay = Number($("delay").value);
  const weightTotal = updateWeightTotal();

  if (!/^https:\/\/(forms\.gle|docs\.google\.com)\//i.test(formUrl)) {
    throw new Error("Hãy nhập URL Google Form hợp lệ (https://forms.gle/... hoặc docs.google.com/forms/...).");
  }
  if (!Number.isInteger(total) || total < 1) throw new Error("Số lần chạy phải từ 1 trở lên.");
  if (!Number.isFinite(delay) || delay < 0) throw new Error("Delay không được âm.");
  if (weightTotal !== 100) throw new Error("Tổng Rating Weights phải bằng 100%.");

  return { FORM_URL: formUrl, TOTAL_SUBMISSIONS: total, DELAY_BETWEEN_SUBMISSIONS: delay, HEADLESS: $("headless").checked, RATING_WEIGHTS: getWeights() };
}

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) throw new Error(data.error || data.message || "Yêu cầu thất bại.");
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
  badge.innerHTML = `<span class="status-dot"></span>${running ? "Đang chạy" : "Đã dừng"}`;
  $("startButton").disabled = running;
  $("stopButton").disabled = !running;
  controls.forEach((id) => { $(id).disabled = running; });
}

async function refreshStatus() {
  try { setRunning((await api("/status")).running); } catch { setMessage("Không kết nối được server. Hãy chạy npm run web.", "error"); }
}

async function loadConfig() {
  const config = await api("/config");
  $("formUrl").value = config.FORM_URL || "";
  $("total").value = config.TOTAL_SUBMISSIONS ?? 1;
  $("delay").value = config.DELAY_BETWEEN_SUBMISSIONS ?? 0;
  $("headless").checked = Boolean(config.HEADLESS);
  for (const n of [1, 2, 3, 4, 5]) $("rating" + n).value = config.RATING_WEIGHTS?.[n] ?? 0;
  updateWeightTotal();
}

$("saveButton").addEventListener("click", async () => { try { await saveConfig(); } catch (error) { setMessage(error.message, "error"); } });
$("startButton").addEventListener("click", async () => { try { await saveConfig({ quiet: true }); const data = await api("/start", { method: "POST" }); setMessage(data.message, "success"); await refreshStatus(); } catch (error) { setMessage(error.message, "error"); } });
$("stopButton").addEventListener("click", async () => { try { const data = await api("/stop", { method: "POST" }); setMessage(data.message, "success"); await refreshStatus(); } catch (error) { setMessage(error.message, "error"); } });
[1, 2, 3, 4, 5].forEach((n) => $("rating" + n).addEventListener("input", updateWeightTotal));

(async () => { try { await loadConfig(); await refreshStatus(); pollId = window.setInterval(refreshStatus, 1500); } catch (error) { setMessage(error.message, "error"); } })();
window.addEventListener("beforeunload", () => clearInterval(pollId));
