import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PORT = 3000;

// thư mục web/
const WEB_DIR = import.meta.dirname;

// thư mục GG_Form_Tool/
const ROOT_DIR = path.join(WEB_DIR, "..");

const CONFIG_PATH = path.join(WEB_DIR, "config.json");

const HTML_PATH = path.join(WEB_DIR, "index.html");

const AUTOFILL_PATH = path.join(ROOT_DIR, "gg_form_autofill.js");

let runningProcess = null;

function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // ==================================
  // GIAO DIỆN
  // ==================================
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync(HTML_PATH, "utf8");

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
    });

    res.end(html);
    return;
  }

  // ==================================
  // ĐỌC CONFIG
  // ==================================
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

  // ==================================
  // LƯU CONFIG
  // ==================================
  if (req.method === "POST" && req.url === "/config") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const config = JSON.parse(body);

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");

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

  // ==================================
  // CHẠY TOOL
  // ==================================
  if (req.method === "POST" && req.url === "/start") {
    if (runningProcess) {
      sendJSON(res, {
        success: false,
        message: "⚠ Tool đang chạy",
      });

      return;
    }

    console.log("\n🚀 BẮT ĐẦU TOOL\n");

    runningProcess = spawn(process.execPath, [AUTOFILL_PATH], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    runningProcess.on("close", (code) => {
      console.log(`\nTool kết thúc: ${code}`);

      runningProcess = null;
    });

    sendJSON(res, {
      success: true,
      message: "▶ Đã bắt đầu chạy",
    });

    return;
  }

  // ==================================
  // DỪNG TOOL
  // ==================================
  if (req.method === "POST" && req.url === "/stop") {
    if (!runningProcess) {
      sendJSON(res, {
        success: false,
        message: "Tool hiện không chạy",
      });

      return;
    }

    runningProcess.kill();

    runningProcess = null;

    sendJSON(res, {
      success: true,
      message: "⛔ Đã dừng tool",
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log("\n✅ WEB CONTROL đang chạy");

  console.log(`👉 http://localhost:${PORT}\n`);
});
