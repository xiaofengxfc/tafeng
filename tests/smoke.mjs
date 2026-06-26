/**
 * HTTP 冒烟测试
 * 检查 Worker 服务是否正常响应
 * 用法: node tests/smoke.mjs [port=8787]
 */

import http from "node:http";

const port = Number(process.argv[2]) || 8787;
const baseUrl = `http://127.0.0.1:${port}`;

const paths = [
  { path: "/", desc: "首页", expectCode: 200 },
  { path: "/api/auth/state", desc: "认证状态 API", expectCode: [200, 401] },
];

let passed = 0;
let failed = 0;

function fetch(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

async function run() {
  console.log("═".repeat(50));
  console.log(` HTTP 冒烟测试 — ${baseUrl}`);
  console.log("═".repeat(50));

  for (const { path, desc, expectCode } of paths) {
    try {
      const { status } = await fetch(path);
      const expected = Array.isArray(expectCode) ? expectCode : [expectCode];
      if (expected.includes(status)) {
        console.log(`✅ ${desc} (${path}) → ${status}`);
        passed++;
      } else {
        console.log(`❌ ${desc} (${path}) → 期望 ${expected.join("/")}，实际 ${status}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${desc} (${path}) → 连接失败: ${err.message}`);
      failed++;
    }
  }

  console.log("");
  console.log(`通过: ${passed}  失败: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
