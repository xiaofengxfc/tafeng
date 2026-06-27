/**
 * 下拉面板兼容性测试
 *
 * 验证所有可折叠面板的 CSS 和行为正确
 * 用法: node tests/dropdown.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const appPath = resolve(__dirname, "../src/App.tsx");
const connPath = resolve(__dirname, "../src/components/ConnectionPanel.tsx");

const css = readFileSync(cssPath, "utf-8");
const app = readFileSync(appPath, "utf-8");
const conn = readFileSync(connPath, "utf-8");

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
console.log(" 下拉面板兼容性测试");
console.log("═".repeat(50));

// ── 1. 面板展开/折叠 ──

console.log("\n── 面板展开/折叠 ──");

check(
  "Base: .mobile-panel-content 默认 display: none（组合选择器）",
  css.includes('.mobile-panel-content, .mobile-form-content') && css.includes('display: none')
);

check(
  "Base: .mobile-panel-content.open display: block（组合选择器）",
  css.includes('.mobile-panel-content.open, .mobile-form-content.open') && css.includes('display: block')
);

check(
  "Base: 展开面板有 max-height: 70vh",
  /max-height:\s*70vh/.test(css)
);

check(
  "Base: 展开面板有 overflow-y: auto",
  /overflow-y:\s*auto/.test(css)
);

check(
  "Base: 展开面板有 iOS 滚动",
  /overflow-scrolling/.test(css)
);

check(
  "Base: .mobile-form-content 默认 display: none（组合选择器）",
  css.includes('.mobile-panel-content, .mobile-form-content') && css.includes('display: none')
);

check(
  "Base: .mobile-form-content.open display: block（组合选择器）",
  css.includes('.mobile-panel-content.open, .mobile-form-content.open') && css.includes('display: block')
);

// ── 2. 面板类型 ──

console.log("\n── 面板类型 ──");

check(
  "App.tsx: 文件管理面板存在",
  app.includes('panelsOpen.files')
);

check(
  "App.tsx: 命令历史面板存在",
  app.includes('panelsOpen.history')
);

check(
  "App.tsx: 实时状态面板存在",
  app.includes('panelsOpen.monitor')
);

check(
  "App.tsx: 三个面板的 toggle 按钮",
  app.includes('mobile-panel-toggle')
);

check(
  "ConnectionPanel: 表单折叠面板存在",
  conn.includes('mobile-form-toggle')
);

// ── 3. 内容可读性 ──

console.log("\n── 内容可读性 ──");

check(
  "Base: .mobile-panel-content 内部元素圆角清零",
  css.includes('border-radius: 0') || css.includes('border-radius:0')
);

check(
  "Desktop: .mobile-form-content display: block (始终展开)",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.mobile-form-content\s*\{[^}]*display:\s*block/.test(css)
);

check(
  "Desktop: .mobile-form-toggle display: none (隐藏切换按钮)",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.mobile-form-toggle\s*\{[^}]*display:\s*none/.test(css)
);

// ── 4. 浅色主题 ──

console.log("\n── 浅色主题 ──");

check(
  "Light: .mobile-panel-toggle 配色",
  css.includes('.light .mobile-panel-toggle')
);

check(
  "Light: .mobile-form-toggle 配色",
  css.includes('.light .mobile-form-toggle')
);

check(
  "Light: .connection-form-wrap 背景",
  css.includes('.light .connection-form-wrap')
);

// ── 5. 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
