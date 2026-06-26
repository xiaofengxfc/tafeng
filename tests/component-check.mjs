/**
 * 组件渲染测试（Node.js 版）
 * 解析 TypeScript 组件文件并验证其结构完整性
 * 用法: node tests/component-check.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, "../src");
const compDir = resolve(srcDir, "components");

const REQUIRED_EXPORTS = [
  { file: "App.tsx", dir: srcDir, export: "default function App" },
  { file: "ConnectionPanel.tsx", dir: compDir, export: "ConnectionPanel" },
  { file: "TerminalPane.tsx", dir: compDir, export: "TerminalPane" },
  { file: "FileEditor.tsx", dir: compDir, export: "FileEditor" },
  { file: "CommandHistoryPanel.tsx", dir: compDir, export: "CommandHistoryPanel" },
  { file: "MonitorPanel.tsx", dir: compDir, export: "MonitorPanel" },
  { file: "LoginGate.tsx", dir: compDir, export: "LoginGate" },
  { file: "SettingsPanel.tsx", dir: compDir, export: "SettingsPanel" },
];

const REQUIRED_IMPORTS = {
  "App.tsx": ["ConnectionPanel", "TerminalPane", "FileEditor", "CommandHistoryPanel", "MonitorPanel", "SettingsPanel", "LoginGate"],
  "ConnectionPanel.tsx": ["ServerProfile"],
  "FileEditor.tsx": ["TerminalMessage", "RemoteFile"],
  "CommandHistoryPanel.tsx": ["CommandHistoryEntry"],
  "MonitorPanel.tsx": ["ProcessInfo", "ServerMetrics"],
};

let errors = [];
let warnings = [];

// 1. 检查组件文件是否存在
for (const { file, dir, export: exp } of REQUIRED_EXPORTS) {
  const filePath = resolve(dir, file);
  try {
    readFileSync(filePath, "utf-8");
  } catch {
    errors.push(`缺少组件文件: ${file}`);
  }
}

// 2. 检查导出和导入
for (const { file, dir, export: exp } of REQUIRED_EXPORTS) {
  const filePath = resolve(dir, file);
  try {
    const content = readFileSync(filePath, "utf-8");

    if (!content.includes(exp)) {
      errors.push(`${file}: 缺少导出 "${exp}"`);
    }

    // 检查必需的导入
    const imports = REQUIRED_IMPORTS[file];
    if (imports) {
      for (const imp of imports) {
        if (!content.includes(imp)) {
          warnings.push(`${file}: 缺少导入 "${imp}"`);
        }
      }
    }
  } catch {
    // 文件不存在已在上面检查
  }
}

// 3. 检查 components 目录
try {
  const files = readdirSync(compDir);
  const tsxFiles = files.filter(f => f.endsWith(".tsx"));
  
  if (tsxFiles.length < 6) {
    warnings.push(`components 目录仅有 ${tsxFiles.length} 个 TSX 文件: ${tsxFiles.join(", ")}`);
  }
} catch {
  errors.push("components 目录不存在");
}

// 4. 检查 shared/types.ts 中的消息类型
const typesPath = resolve(__dirname, "../shared/types.ts");
try {
  const types = readFileSync(typesPath, "utf-8");
  const messageTypes = ["sftp-ls", "sftp-read", "sftp-write", "sftp-upload", "sftp-download",
    "sftp-ls-result", "sftp-read-result", "sftp-write-result", "sftp-upload-progress",
    "sftp-download-chunk", "sftp-error",
    "input", "output", "resize", "metrics", "error", "hello"];
  
  for (const mt of messageTypes) {
    if (!types.includes(mt)) {
      warnings.push(`shared/types.ts: 缺少消息类型 "${mt}"`);
    }
  }
} catch {
  errors.push("shared/types.ts 不存在");
}

// 输出
console.log("═".repeat(50));
console.log(" 组件结构验证结果");
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

process.exit(errors.length > 0 ? 1 : 0);
