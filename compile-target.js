import { OfflineCompiler } from './src/image-target/offline-compiler.js';
import { loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Compiling joel-target.jpeg into targets.mind...');
  const imagePath = path.resolve('examples/image-tracking/assets/joel-target.jpeg');
  const img = await loadImage(imagePath);

  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets([img], (progress) => {
    console.log(`Compilation progress: ${progress.toFixed(2)}%`);
  });

  const buffer = await compiler.exportData();
  const outputPath1 = path.resolve('examples/image-tracking/assets/targets.mind');
  const outputPath2 = path.resolve('examples/image-tracking/assets/frame001.mind');

  fs.writeFileSync(outputPath1, Buffer.from(buffer));
  fs.writeFileSync(outputPath2, Buffer.from(buffer));

  console.log('✅ Successfully compiled and saved new targets.mind and frame001.mind!');
}

run().catch((err) => {
  console.error('Compilation error:', err);
});
