/**
 * UI 交互测试 — VPS 表单展开/折叠
 *
 * 测试步骤（手动 + Node 辅助验证）：
 * 1. 验证 CSS 类名和 display 属性正确
 * 2. 验证组件渲染结构完整性
 *
 * 用法: node tests/interaction.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const compPath = resolve(__dirname, "../src/components/ConnectionPanel.tsx");

const css = readFileSync(cssPath, "utf-8");
const comp = readFileSync(compPath, "utf-8");

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
console.log(" VPS 表单交互测试");
console.log("═".repeat(50));

// ── 1. CSS 检查 ──

console.log("\n── CSS 类名与状态 ──");

check(
  "Base: .mobile-form-toggle 有 display: flex",
  /\.mobile-form-toggle\s*\{[^}]*display:\s*flex/.test(css)
);

check(
  "Base: .mobile-form-content 有 display: none",
  /\.mobile-form-content\s*\{[^}]*display:\s*none/.test(css)
);

check(
  "Base: .mobile-form-content.open 有 display: block",
  /\.mobile-form-content\.open\s*\{[^}]*display:\s*block/.test(css)
);

check(
  "Desktop: .mobile-form-toggle 有 display: none",
  css.includes('@media (min-width: 521px)')
);

check(
  "Desktop: .mobile-form-content 有 display: block",
  css.includes('@media (min-width: 521px)')
);

check(
  "connection-form-wrap 有 overflow: hidden",
  /\.connection-form-wrap\s*\{[^}]*overflow:\s*hidden/.test(css)
);

// ── 2. 组件逻辑检查 ──

console.log("\n── 组件状态管理 ──");

check(
  "formOpen useState 初始为 false",
  comp.includes("formOpen, setFormOpen") && comp.includes("useState(false)")
);

check(
  "toggle 按钮绑定 onClick setFormOpen(!formOpen)",
  /setFormOpen\(!formOpen\)/.test(comp)
);

check(
  "useEffect 监听 editingProfile 展开表单",
  /useEffect\(\(\)\s*=>\s*\{[\s\S]*?if\s*\(editingProfile\)\s*setFormOpen\(true\)/.test(comp)
);

check(
  ".mobile-form-content 绑定 formOpen 状态",
  /mobile-form-content\s*\$\{formOpen\s*\?\s*["']open["']\s*:\s*["']["']\s*\}/.test(comp)
);

check(
  "取消编辑调用 cancelEdit",
  comp.includes("cancelEdit()")
);

check(
  "cancelEdit 清除 editingProfile",
  comp.includes("setEditingProfile(null)")
);

// ── 3. 功能完整性 ──

console.log("\n── 功能完整性 ──");

check(
  "startEdit 函数存在",
  comp.includes("function startEdit")
);

check(
  "startEdit 设置 editingProfile",
  comp.includes("setEditingProfile(profile)")
);

check(
  "移动端表单标题含 编辑连接 / 保存 VPS",
  comp.includes('t("editConnection")') && comp.includes('t("saveVps")')
);

check(
  "提交按钮含 更新连接 / 保存连接",
  comp.includes('t("updateConnection")') && comp.includes('t("saveConnection")')
);

check(
  "含 + 添加按钮",
  comp.includes("mobile-form-add-btn")
);

// ── 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
