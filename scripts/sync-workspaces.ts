import fs from 'fs';
import path from 'path';

const srcDir = process.cwd();
const targetDir = 'c:\\Users\\PC\\.gemini\\antigravity\\scratch\\js store pag prueba 2\\jg-store';

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      if (child === 'node_modules' || child === '.next' || child === '.git') continue;
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('Sincronizando archivos entre workspaces...');
copyRecursive(path.join(srcDir, 'src'), path.join(targetDir, 'src'));
copyRecursive(path.join(srcDir, 'supabase'), path.join(targetDir, 'supabase'));
copyRecursive(path.join(srcDir, 'scripts'), path.join(targetDir, 'scripts'));
copyRecursive(path.join(srcDir, '.agents'), path.join(targetDir, '.agents'));
console.log('✅ Sincronización dual completada con éxito.');
