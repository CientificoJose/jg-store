/**
 * =====================================================================
 * JG STORE - SCRIPT CLI PARA AUDITAR IMÁGENES DE PRODUCTOS
 * =====================================================================
 * Ejecución:
 *   bun run scripts/audit-product-images.ts
 *
 * Argumentos opcionales:
 *   --export            Guarda los productos sin imagen en missing-images.json
 *   --category <slug>   Filtra la auditoría por una categoría específica
 *   --quick             Auditoría rápida sin verificar Storage objeto por objeto
 */

import { auditProductImages } from '../src/lib/product-audit';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const shouldExport = args.includes('--export');
  const quick = args.includes('--quick');

  const catIdx = args.indexOf('--category');
  const category = catIdx !== -1 && args[catIdx + 1] ? args[catIdx + 1] : undefined;

  console.log('\n=============================================================');
  console.log('🔍 INICIANDO AUDITORÍA DE IMÁGENES EN EL CATÁLOGO (JG STORE)');
  console.log('=============================================================');
  if (category) console.log(`📁 Filtrando por categoría: ${category}`);
  if (quick) console.log(`⚡ Modo rápido activo (sin validación exhaustiva de Storage)`);

  const startTime = Date.now();
  const result = await auditProductImages({
    verifyStorage: !quick,
    category
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  const { summary } = result;

  console.log('\n📊 RESUMEN GENERAL DE IMÁGENES:');
  console.log('-------------------------------------------------------------');
  console.log(`📦 Total de productos registrados:     ${summary.total_products.toLocaleString()}`);
  console.log(`🖼️  Archivos encontrados en Storage:    ${summary.storage_files_count.toLocaleString()}`);
  console.log('-------------------------------------------------------------');
  console.log(`✅ Con imagen confirmada y visible:    ${summary.total_effective_images.toLocaleString()} (${summary.percentage_with_image}%)`);
  console.log(`❌ Sin imagen (o no cargada a storage):${summary.total_missing_effective.toLocaleString()} (${(100 - summary.percentage_with_image).toFixed(1)}%)`);
  console.log(`   └─ URL vacía o de relleno:          ${summary.missing_image.toLocaleString()}`);
  console.log(`   └─ URL en BD pero sin foto en disco:${summary.broken_storage.toLocaleString()}`);
  console.log('-------------------------------------------------------------');
  console.log(`⏱️  Auditoría completada en ${elapsed}s`);

  // Mostrar una muestra de productos CON imagen
  if (result.products_with_image.length > 0) {
    console.log('\n🟢 Muestra de productos CON imagen (primeros 5):');
    result.products_with_image.slice(0, 5).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.sku}] ${p.name.slice(0, 40)}... -> ${p.storage_file_name || p.image_url}`);
    });
  }

  // Mostrar una muestra de productos SIN imagen
  const missingAll = [...result.products_without_image, ...result.products_broken_storage];
  if (missingAll.length > 0) {
    console.log('\n🔴 Muestra de productos SIN imagen (primeros 5):');
    missingAll.slice(0, 5).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.sku}] ${p.name.slice(0, 45)}... (Razón: ${p.reason || 'Sin archivo'})`);
    });
  }

  if (shouldExport) {
    const exportPath = path.resolve(process.cwd(), 'scripts', 'missing-images.json');
    fs.writeFileSync(exportPath, JSON.stringify(missingAll, null, 2), 'utf-8');
    console.log(`\n💾 Archivo exportado exitosamente en: ${exportPath} (${missingAll.length} productos)`);
  } else {
    console.log('\n💡 Consejo: Puedes exportar la lista completa de productos sin imagen ejecutando:');
    console.log('   bun run scripts/audit-product-images.ts --export\n');
  }
}

main().catch((err) => {
  console.error('\n❌ Error ejecutando la auditoría:', err);
  process.exit(1);
});
