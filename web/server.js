import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PORT = 3000;

// =====================================
// PATH
// =====================================

const WEB_DIR = import.meta.dirname;

const ROOT_DIR = path.resolve(WEB_DIR, "..");

const CONFIG_PATH = path.join(WEB_DIR, "config.json");

const AUTOFILL_PATH = path.join(ROOT_DIR, "gg_form_autofill.js");

let runningProcess = null;
let runLogs = [];
let lastRunResult = null;
let currentRunError = null;

function appendRunLog(chunk) {
  const text = String(chunk).replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("__FORMFLOW_ERROR__")) {
      currentRunError = line.slice("__FORMFLOW_ERROR__".length).trim();
      runLogs.push(`LỖI: ${currentRunError}`);
    } else {
      runLogs.push(line);
    }
  }
  runLogs = runLogs.slice(-80);
}

// =====================================
// MIME TYPES
// =====================================

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

// =====================================
// SEND JSON
// =====================================

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",

    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });

  res.end(JSON.stringify(data));
}

const WEIGHT_TYPES = ["multipleChoice", "dropdown", "linearScale", "rating", "multipleChoiceGrid"];
const DEFAULT_WEIGHTS = { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 };

function normalizeWeights(weights, label) {
  if (!weights || typeof weights !== "object") throw new Error(`Thiếu tỷ lệ cho ${label}.`);
  const normalized = Object.fromEntries([1, 2, 3, 4, 5].map((rating) => [rating, Number(weights[rating])]));
  if (Object.values(normalized).some((weight) => !Number.isFinite(weight) || weight < 0 || weight > 100)) {
    throw new Error(`Mỗi tỷ lệ của ${label} phải nằm trong khoảng 0–100.`);
  }
  if (Object.values(normalized).reduce((sum, weight) => sum + weight, 0) !== 100) {
    throw new Error(`Tổng tỷ lệ của ${label} phải bằng 100%.`);
  }
  return normalized;
}

function validateConfig(config) {
  const formUrl = String(config.FORM_URL || "").trim();
  const total = Number(config.TOTAL_SUBMISSIONS);
  const delay = Number(config.DELAY_BETWEEN_SUBMISSIONS);

  if (!/^https:\/\/(forms\.gle|docs\.google\.com)\//i.test(formUrl)) {
    throw new Error("FORM_URL phải là URL Google Form hợp lệ.");
  }
  if (!Number.isInteger(total) || total < 1) throw new Error("TOTAL_SUBMISSIONS phải là số nguyên dương.");
  if (!Number.isFinite(delay) || delay < 0) throw new Error("DELAY_BETWEEN_SUBMISSIONS không được âm.");
  const legacyWeights = config.RATING_WEIGHTS || DEFAULT_WEIGHTS;
  const questionTypeWeights = Object.fromEntries(
    WEIGHT_TYPES.map((type) => [type, normalizeWeights(config.QUESTION_TYPE_WEIGHTS?.[type] || legacyWeights, type)]),
  );

  return {
    FORM_URL: formUrl,
    TOTAL_SUBMISSIONS: total,
    DELAY_BETWEEN_SUBMISSIONS: delay,
    HEADLESS: Boolean(config.HEADLESS),
    QUESTION_TYPE_WEIGHTS: questionTypeWeights,
  };
}

// =====================================
// STATIC FILE
// =====================================

function serveStaticFile(req, res) {
  let requestPath = req.url.split("?")[0];

  requestPath = decodeURIComponent(requestPath);

  // /
  // => /index.html
  if (requestPath === "/") {
    requestPath = "/index.html";
  }

  // bỏ dấu / đầu tiên
  const relativePath = requestPath.replace(/^\/+/, "");

  const filePath = path.resolve(WEB_DIR, relativePath);

  // chống truy cập ra ngoài web/
  if (path.relative(WEB_DIR, filePath).startsWith("..")) {
    return false;
  }

  if (!fs.existsSync(filePath)) {
    return false;
  }

  if (!fs.statSync(filePath).isFile()) {
    return false;
  }

  try {
    const ext = path.extname(filePath).toLowerCase();

    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const file = fs.readFileSync(filePath);

    res.writeHead(200, {
      "Content-Type": contentType,

      // tránh CSS cũ bị cache
      "Cache-Control": "no-cache, no-store, must-revalidate",

      Pragma: "no-cache",

      Expires: "0",
    });

    res.end(file);

    return true;
  } catch (error) {
    res.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8",
    });

    res.end(error.message);

    return true;
  }
}

// =====================================
// SERVER
// =====================================

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  // =================================
  // GET CONFIG
  // =================================

  if (req.method === "GET" && req.url === "/config") {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

      sendJSON(res, config);
    } catch (error) {
      sendJSON(
        res,
        {
          success: false,
          error: error.message,
        },
        500,
      );
    }

    return;
  }

  // =================================
  // SAVE CONFIG
  // =================================

  if (req.method === "POST" && req.url === "/config") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) req.destroy();
    });

    req.on("end", () => {
      try {
        const config = validateConfig(JSON.parse(body));

        fs.writeFileSync(
          CONFIG_PATH,

          JSON.stringify(config, null, 2),

          "utf8",
        );

        sendJSON(res, {
          success: true,

          message: "✅ Đã lưu cấu hình",
        });
      } catch (error) {
        sendJSON(
          res,
          {
            success: false,

            error: error.message,
          },
          500,
        );
      }
    });

    return;
  }

  // =================================
  // STATUS
  // =================================

  if (req.method === "GET" && req.url === "/status") {
    sendJSON(res, {
      running: runningProcess !== null,
      logs: runLogs.slice(-20),
      lastRunResult,
    });

    return;
  }

  if (req.method === "POST" && req.url === "/status/clear") {
    if (!runningProcess) {
      runLogs = [];
      lastRunResult = null;
      currentRunError = null;
    }
    sendJSON(res, { success: true });
    return;
  }

  // =================================
  // START
  // =================================

  if (req.method === "POST" && req.url === "/start") {
    if (runningProcess) {
      sendJSON(res, {
        success: false,

        message: "⚠ Tool đang chạy",
      });

      return;
    }

    if (!fs.existsSync(AUTOFILL_PATH)) {
      sendJSON(res, { success: false, message: "Không tìm thấy gg_form_autofill.js." }, 500);
      return;
    }

    console.log("\n==============================");

    console.log("🚀 BẮT ĐẦU GG FORM TOOL");

    console.log("==============================\n");

    try {
      runLogs = [];
      lastRunResult = null;
      currentRunError = null;
      runningProcess = spawn(
        process.execPath,

        [AUTOFILL_PATH],

        {
          cwd: ROOT_DIR,

          stdio: ["ignore", "pipe", "pipe"],
        },
      );

      runningProcess.stdout.on("data", (chunk) => {
        process.stdout.write(chunk);
        appendRunLog(chunk);
      });

      runningProcess.stderr.on("data", (chunk) => {
        process.stderr.write(chunk);
        appendRunLog(chunk);
      });

      runningProcess.on("close", (code) => {
        console.log(`\nTool kết thúc: ${code}`);
        lastRunResult = {
          success: code === 0,
          code,
          message: code === 0 ? "Đã hoàn thành tất cả lượt gửi." : (currentRunError || "Tool đã dừng do lỗi."),
          finishedAt: new Date().toISOString(),
          logs: runLogs.slice(-30),
        };
        runningProcess = null;
      });

      runningProcess.on("error", (error) => {
        console.error("\n❌ TOOL ERROR:", error.message);
        appendRunLog(error.message);
        lastRunResult = {
          success: false,
          code: null,
          message: error.message,
          finishedAt: new Date().toISOString(),
          logs: runLogs.slice(-30),
        };
        runningProcess = null;
      });

      sendJSON(res, {
        success: true,

        message: "▶ Đã bắt đầu chạy",
      });
    } catch (error) {
      runningProcess = null;

      sendJSON(
        res,
        {
          success: false,

          message: error.message,
        },
        500,
      );
    }

    return;
  }

  // =================================
  // STOP
  // =================================

  if (req.method === "POST" && req.url === "/stop") {
    if (!runningProcess) {
      sendJSON(res, {
        success: false,

        message: "Tool hiện không chạy",
      });

      return;
    }

    const processToKill = runningProcess;

    const pid = processToKill.pid;

    console.log(`\n⛔ Đang dừng PID ${pid}`);

    if (process.platform === "win32") {
      const killer = spawn(
        "taskkill",

        ["/PID", String(pid), "/T", "/F"],

        {
          stdio: "ignore",
        },
      );

      killer.on("close", () => {
        console.log("✓ Đã dừng process tree");
      });
    } else {
      processToKill.kill("SIGTERM");
    }

    runningProcess = null;

    sendJSON(res, {
      success: true,

      message: "⛔ Đã dừng tool",
    });

    return;
  }

  // =================================
  // STATIC FILE
  //
  // /
  // /style.css
  // ...
  // =================================

  if (req.method === "GET") {
    const served = serveStaticFile(req, res);

    if (served) {
      return;
    }
  }

  // =================================
  // 404
  // =================================

  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
  });

  res.end("404 - Not Found");
});

// =====================================
// START SERVER
// =====================================

server.listen(PORT, () => {
  console.log("\n==============================");

  console.log("✅ GG FORM TOOL WEB CONTROL");

  console.log("==============================");

  console.log(`🌐 http://localhost:${PORT}`);

  console.log(`🎨 http://localhost:${PORT}/style.css`);

  console.log("==============================\n");
});
