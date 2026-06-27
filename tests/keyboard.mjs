/**
 * 手机端输入法兼容性测试
 *
 * 验证 editor 在键盘弹出时的滚动适配逻辑
 * 用法: node tests/keyboard.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compPath = resolve(__dirname, "../src/components/FileEditor.tsx");

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

// ── 1. 键盘检测 ──

console.log("\n── 键盘检测 ──");

check(
  "visualViewport resize 监听",
  comp.includes("visualViewport")
);

check(
  "视口高度缩小 >100px 判定为键盘打开",
  comp.includes("diff > 100")
);

check(
  "记录上次视口高度用于差值计算",
  comp.includes("lastHeight")
);

check(
  "键盘关闭时自动复位（不触发滚动）",
  comp.includes("lastHeight = vv.height")
);

// ── 2. 滚动适配 ──

console.log("\n── 滚动适配 ──");

check(
  "scrollIntoView 调用",
  comp.includes("scrollIntoView")
);

check(
  "滚动到视口顶部 (block: start)",
  comp.includes("block:") && comp.includes("start")
);

check(
  "平滑滚动 (behavior: smooth)",
  comp.includes("behavior:") && comp.includes("smooth")
);

check(
  "额外向上补偿 40px 避免工具栏遮挡",
  comp.includes("scrollBy")
);

check(
  "延迟 400ms 等待键盘动画完成",
  comp.includes("setTimeout") && comp.includes("400")
);

// ── 3. 安全降级 ──

console.log("\n── 安全降级 ──");

check(
  "vv 为空时跳过（不支持 visualViewport 的浏览器）",
  comp.includes("if (!vv) return")
);

check(
  "editorRef 为空时跳过",
  comp.includes("if (!editorRef.current) return")
);

check(
  "清理: resize 事件监听移除",
  comp.includes("removeEventListener")
);

check(
  "清理: keyboardTimerRef 清除",
  comp.includes("clearTimeout")
);

// ── 4. 无 CSS 副作用 ──

console.log("\n── 无 CSS 副作用 ──");

check(
  "不使用 keyboard-open CSS 类（纯滚动方案）",
  !comp.includes("keyboard-open")
);

check(
  "不使用 keyboardVisible state",
  !comp.includes("keyboardVisible")
);

// ── 5. 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);
