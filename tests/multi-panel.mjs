/**
 * 多面板同时展开布局测试
 *
 * 验证所有下拉面板同时打开时布局不崩溃
 * 用法: node tests/multi-panel.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const appPath = resolve(__dirname, "../src/App.tsx");

const css = readFileSync(cssPath, "utf-8");
const app = readFileSync(appPath, "utf-8");

let passed = 0;
let failed = 0;

function check(desc, condition) {
  if (condition) {
    console.log(`  ✅ ${desc}`);
    passed++;
  } else {
    console.log(`  ❌ ${desc}`);
    failed++;
  }
}

console.log("═".repeat(50));
console.log(" 多面板同时展开布局测试");
console.log("═".repeat(50));

// ── 1. 终端保护 ──

console.log("\n── 终端保护 ──");

check(
  "Base: .terminal-wrap 有 min-height: 120px",
  /\.terminal-wrap\s*\{[^}]*min-height:\s*120px/.test(css)
);

check(
  "Base: .terminal-wrap 有 flex-shrink: 0",
  /\.terminal-wrap\s*\{[^}]*flex-shrink:\s*0/.test(css)
);

check(
  "Base: .terminal-wrap 有 flex: 1",
  /\.terminal-wrap\s*\{[^}]*flex:\s*1/.test(css)
);

check(
  "Desktop: .center-stack 使用 grid（flex 在 grid 中无效，安全）",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.center-stack\s*\{[^}]*display:\s*grid/.test(css)
);

// ── 2. 面板数量 ──

console.log("\n── 面板数量 ──");

// 计算 mobile-panel-toggle 出现次数
const toggleMatches = app.match(/mobile-panel-toggle/g);
check(
  `App.tsx: 有 ${toggleMatches ? toggleMatches.length : 0} 个可折叠面板 toggle`,
  toggleMatches && toggleMatches.length === 3
);

// 计算 panelsOpen 状态数量
const filesPanel = app.includes("panelsOpen.files");
const historyPanel = app.includes("panelsOpen.history");
const monitorPanel = app.includes("panelsOpen.monitor");
check(
  "App.tsx: 文件管理面板状态",
  filesPanel
);
check(
  "App.tsx: 命令历史面板状态",
  historyPanel
);
check(
  "App.tsx: 实时状态面板状态",
  monitorPanel
);

// ── 3. 布局稳定性 ──

console.log("\n── 布局稳定性 ──");

check(
  "Base: .workspace overflow-y: auto (整体滚动)",
  /\.workspace\s*\{[^}]*overflow-y:\s*auto/.test(css)
);

check(
  "Base: .workspace 有 height: calc(100vh - 44px)",
  /height:\s*calc\(100vh\s*-\s*44px\)/.test(css)
);

check(
  "Base: .center-stack 有 flex: 1 填充工作区",
  /\.center-stack\s*\{[^}]*flex:\s*1/.test(css)
);

check(
  "Base: .center-stack 有 min-height: 0",
  /\.center-stack\s*\{[^}]*min-height:\s*0/.test(css)
);

check(
  "Base: .mobile-panel-content.open 有 max-height: 70vh",
  /max-height:\s*70vh/.test(css)
);

check(
  "Base: .mobile-panel-content.open 有 overflow-y: auto",
  /overflow-y:\s*auto/.test(css)
);

check(
  "Base: .side-panel 有 overflow-y: auto",
  /\.side-panel\s*\{[^}]*overflow-y:\s*auto/.test(css)
);

check(
  "Base: .side-panel 有 max-height: 180px",
  /\.side-panel\s*\{[^}]*max-height:\s*180px/.test(css)
);

// ── 4. 桌面端适配 ──

console.log("\n── 桌面端适配 ──");

check(
  "Desktop: .workspace 是 grid 布局",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.workspace\s*\{[^}]*display:\s*grid/.test(css)
);

check(
  "Desktop: .center-stack 是 grid 布局",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.center-stack\s*\{[^}]*display:\s*grid/.test(css)
);

// ── 5. 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
