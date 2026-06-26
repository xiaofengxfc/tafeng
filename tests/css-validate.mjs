/**
 * CSS 样式验证脚本
 * 检查：颜色一致性、断点覆盖、关键选择器
 * 用法: node tests/css-validate.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const css = readFileSync(cssPath, "utf-8");

let errors = [];
let warnings = [];

// 1. 颜色一致性：检查色板中定义的颜色是否被正确使用
const PALETTE = [
  "#0a0a0b", "#151517", "#1c1c1e", "#2c2c2e",
  "#363639", "#38383a", "#007aff", "#ebebed", "#8e8e93",
];

// 收集 CSS 中所有颜色值
const colorRegex = /#[0-9a-fA-F]{6}/g;
const usedColors = new Set(css.match(colorRegex) || []);

// 检查是否有色板之外的颜色（白名单中的例外）
const WHITELIST = [
  "#ffffff", "#000000", "#050505",
  "#070707", "#090909", "#0d0d0d",
  "#ff5f57", "#febc2e", "#28c840",
  "#ff453a", "#ff3b30", "#ff8f8f",
  "#264f78", "#78dce8",
  "#070707", "#f5f5f7", "#e8e8ed",
  "#d1d1d6", "#c7c7cc",
  "#ffffff", "#1d1d1f", // light theme
];

for (const color of usedColors) {
  if (!PALETTE.includes(color.toLowerCase()) && !WHITELIST.includes(color.toLowerCase())) {
    warnings.push(`非色板颜色: ${color}`);
  }
}

// 2. 检查关键选择器是否存在
const REQUIRED_SELECTORS = [
  ".app-shell", ".app-header", ".workspace",
  ".side-panel", ".monitor-panel", ".terminal-wrap", ".file-editor", ".history-panel",
  ".center-stack", ".context-line",
  ".connection-item", ".connection-form",
  ".panel-title", ".file-list", ".editor-pane", ".editor-content",
  ".terminal-host", ".terminal-toolbar",
  ".process-row", ".metric-row", ".meter",
  ".mobile-panel", ".mobile-panel-toggle", ".mobile-panel-content",
  ".connection-form-wrap", ".mobile-form-toggle", ".mobile-form-content",
  ".monitor-mobile", ".monitor-desktop",
  ".log-download-btn",
  ".form-label", ".form-row",
  ".history-list", ".history-item",
  ".primary-button", ".secondary-button", ".ghost-button",
];

for (const sel of REQUIRED_SELECTORS) {
  // 在 CSS 中查找选择器（可能在媒体查询内）
  const escaped = sel.replace(/\./g, "\\.").replace(/-/g, "\\-");
  const regex = new RegExp(`${escaped}\\s*\\{`);
  if (!regex.test(css)) {
    errors.push(`缺少选择器: ${sel}`);
  }
}

// 3. 检查断点
const BREAKPOINTS = [
  { name: "mobile-first base", query: "min-width: 521px" },
  { name: "521px+ desktop", query: "min-width: 521px" },
  { name: "1121px+ large", query: "min-width: 1121px" },
  { name: "touch devices", query: "hover: none" },
];

for (const bp of BREAKPOINTS) {
  if (!css.includes(bp.query)) {
    warnings.push(`缺少断点: ${bp.name} (${bp.query})`);
  }
}

// 4. 检查 light 主题
const LIGHT_SELECTORS = [
  ".light .app-shell", ".light .app-header",
  ".light .side-panel", ".light .monitor-panel",
  ".light .terminal-wrap", ".light .file-editor", ".light .history-panel",
  ".light .connection-item",
  ".light .context-line", ".light .terminal-toolbar", ".light .editor-toolbar",
  ".light .editor-content",
  ".light .log-download-btn",
  ".light .process-row",
];

for (const sel of LIGHT_SELECTORS) {
  if (!css.includes(sel)) {
    warnings.push(`浅色主题缺少: ${sel}`);
  }
}

// 打印结果
console.log("═".repeat(50));
console.log(" CSS 样式验证结果");
console.log("═".repeat(50));

if (errors.length === 0) {
  console.log("✅ 严重错误: 0");
} else {
  console.log(`❌ 严重错误: ${errors.length}`);
  errors.forEach(e => console.log(`   ${e}`));
}

if (warnings.length === 0) {
  console.log("✅ 警告: 0");
} else {
  console.log(`⚠️  警告: ${warnings.length}`);
  warnings.forEach(w => console.log(`   ${w}`));
}

console.log(`\n总颜色数: ${usedColors.size}`);
console.log(`CSS 文件大小: ${(css.length / 1024).toFixed(1)} KB`);

process.exit(errors.length > 0 ? 1 : 0);
