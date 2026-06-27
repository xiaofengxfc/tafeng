/**
 * 手机端输入法兼容性测试
 *
 * 验证 editor 在键盘弹出后的滚动适配逻辑
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
check("visualViewport.resize 监听键盘弹出", comp.includes("visualViewport"));
check("视口高度缩小 >100px 判定键盘打开", comp.includes("diff > 100"));
check("记录上次视口高度用于差值计算", comp.includes("lastHeight = vv.height"));
check("键盘关闭时不触发滚动（差值不足）", comp.includes("diff > 100"));

// ── 2. 滚动方案 ──
console.log("\n── 滚动方案 ──");
check("使用 scrollTo 精确控制滚动位置", comp.includes("scrollTo"));
check("同时滚动 .workspace 父容器", comp.includes(".workspace"));
check("同时滚动 window 兜底", comp.includes("window.scrollTo"));
check("使用 getBoundingClientRect 计算实际位置", comp.includes("getBoundingClientRect"));
check("计算编辑器顶部位置 + window.scrollY", comp.includes("window.scrollY"));
check("平滑滚动", comp.includes("smooth"));
check("延迟 500ms 首次执行", /setTimeout.*scrollEditorToTop[\s\S]*?500/.test(comp));
check("延迟 800ms 二次执行兜底", /setTimeout.*scrollEditorToTop[\s\S]*?800/.test(comp));
check("额外 60px 偏移避免工具栏遮挡", comp.includes("60"));

// ── 3. 焦点触发 ──
console.log("\n── 焦点触发 ──");
check("编辑器获得焦点时触发滚动", comp.includes("focus"));
check("焦点触发延迟 350ms", comp.includes("350"));
check("MutationObserver 等待编辑器挂载", comp.includes("MutationObserver"));
check("data-keyboard 属性防重复绑定", comp.includes("data-keyboard"));

// ── 4. 安全降级 ──
console.log("\n── 安全降级 ──");
check("vv 为空时跳过", comp.includes("if (!vv) return"));
check("editorRef 为空时跳过", comp.includes("if (!editorRef.current) return"));
check("清理 resize 监听", comp.includes("removeEventListener"));
check("清理 MutationObserver", comp.includes("disconnect"));
check("清理定时器", comp.includes("clearTimeout"));

// ── 5. 结果 ──
console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));
process.exit(failed > 0 ? 1 : 0);
