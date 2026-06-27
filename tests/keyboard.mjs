/**
 * 手机端输入法兼容性测试
 *
 * 验证 editor 在键盘弹出时的适配逻辑
 * 用法: node tests/keyboard.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const compPath = resolve(__dirname, "../src/components/FileEditor.tsx");

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
console.log(" 手机端输入法兼容性测试");
console.log("═".repeat(50));

// ── 1. CSS ──

console.log("\n── CSS 适配 ──");

check(
  "CSS: .editor-content.keyboard-open 有 min-height: 200px",
  /\.editor-content\.keyboard-open\s*\{[^}]*min-height:\s*200px/.test(css)
);

check(
  "CSS: .editor-content.keyboard-open 有 padding-bottom: 120px",
  /\.editor-content\.keyboard-open\s*\{[^}]*padding-bottom:\s*120px/.test(css)
);

// ── 2. 组件逻辑 ──

console.log("\n── 组件逻辑 ──");

check(
  "组件: keyboardVisible state 存在",
  comp.includes("keyboardVisible")
);

check(
  "组件: visualViewport resize 监听",
  comp.includes("visualViewport")
);

check(
  "组件: 键盘检测阈值 > 100px",
  comp.includes("diff > 100")
);

check(
  "组件: scrollIntoView 调用",
  comp.includes("scrollIntoView")
);

check(
  "组件: keyboard-open CSS 类绑定",
  comp.includes('keyboard-open')
);

check(
  "组件: 键盘状态复位（键盘关闭时清除）",
  comp.includes("setKeyboardVisible(isKeyboardOpen)")
);

// ── 3. 兼容性 ──

console.log("\n── 兼容性 ──");

check(
  "组件: visualViewport 支持检测（vv 非空才监听）",
  comp.includes("if (!vv) return")
);

check(
  "组件: 动画延迟 300ms 等待键盘弹出完成",
  comp.includes("setTimeout") && comp.includes("300")
);

check(
  "组件: 额外向上滚动 20px 避免被遮挡",
  comp.includes("scrollBy")
);

check(
  "组件: 使用 smooth 滚动",
  comp.includes("behavior:") && comp.includes("smooth")
);

// ── 4. 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
