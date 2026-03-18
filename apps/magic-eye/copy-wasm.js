const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'node_modules', 'onnxruntime-web', 'dist');
const destDir = path.join(__dirname, 'public', 'workers');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 복사할 파일들 (라이브러리 본체 .js 포함)
const extensions = ['.wasm', '.mjs', '.js'];

console.log('--- ONNX 자산 복사 시작 (JS/WASM/MJS) ---');

fs.readdirSync(srcDir).forEach((file) => {
  if (extensions.includes(path.extname(file))) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`복사 완료: ${file}`);
  }
});

console.log('--- 복사 완료 ---');
