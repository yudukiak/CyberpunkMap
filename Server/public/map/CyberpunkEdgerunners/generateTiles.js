const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const TILE_SIZE = 256;
const inputFile = 'Night City Edgerunners Atlas Full.png';
const outputDir = 'tiles';
// ズーム倍率 0～8
// 4  4096×4096
// 5  8192×8192
// 6  16384×16384
// 7  32768×32768
const minZoom = 0;
const maxZoom = 6;

async function generateTiles() {
  // ⚠️{ limitInputPixels: false } はセキュリティ的に危うい
  const sharpOptions = { limitInputPixels: false };

  // 元画像のサイズを取得
  const originalMeta = await sharp(inputFile, sharpOptions).metadata();
  console.log(`🎯 入力画像サイズ: ${originalMeta.width}x${originalMeta.height}px`);


  // ズームレベルごとにループ
  for (let z = minZoom; z <= maxZoom; z++) {
    // 現在のズームに応じて画像を縮小
    const scale = Math.pow(2, maxZoom - z);
    const width = Math.round(originalMeta.width / scale);
    const height = Math.round(originalMeta.height / scale);
    console.log(`\n🔄 Zoom ${z}: ${width}x${height} にリサイズ中...`);

    // sharpで画像をリサイズして、メモリ上のバッファとして保持
    const tempFile = `resized-${z}.png`;
    await sharp(inputFile, sharpOptions)
      .resize(width, height)
      .png()
      .toFile(tempFile);

    // バッファからメタ情報を取得（サイズ確認）
    const resized = sharp(tempFile, sharpOptions);
    const resizedMeta = await resized.metadata();

    // 横列数・縦列数を計算（256px単位）
    const cols = Math.ceil(resizedMeta.width / TILE_SIZE);
    const rows = Math.ceil(resizedMeta.height / TILE_SIZE);
    console.log(`🧩 タイル数: 横 ${cols} × 縦 ${rows}（合計: ${cols * rows}）`);

    // x, y の順にタイルを生成
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const left = x * TILE_SIZE;
        const top = y * TILE_SIZE;

        // はみ出し防止：タイルサイズを調整
        const tileWidth = Math.min(TILE_SIZE, resizedMeta.width - left);
        const tileHeight = Math.min(TILE_SIZE, resizedMeta.height - top);

        // 無効なサイズはスキップ（画像の右端や下端）
        if (tileWidth <= 0 || tileHeight <= 0) {
          console.warn(`⚠️ スキップ: z=${z} x=${x} y=${y} サイズ不正`);
          continue;
        }

        // 保存パスの作成
        const tilePath = path.join(outputDir, `${z}`, `${x}`);
        const filename = path.join(tilePath, `${y}.png`);
        await mkdirp.mkdirp(tilePath);

        // 保存
        try {
          await sharp(tempFile, sharpOptions)
            // 念のためRGBAに揃える
            .ensureAlpha()
            // → RGBに統一
            .removeAlpha()
            .extract({ left, top, width: tileWidth, height: tileHeight })
            .png()
            .toFile(filename);
          console.log(`✅ 作成: tiles/${z}/${x}/${y}.png`);
        } catch (err) {
          console.error(`❌ 失敗: z=${z} x=${x} y=${y} →`, err.message);
        }
      }
    }

    // 一時ファイル削除
    fs.unlinkSync(tempFile);
    console.log(`🧹 Zoom ${z} の一時画像削除完了`);
  }

  console.log("🎉 すべてのズームレベルのタイル生成が完了しました！");
}

// 実行開始
generateTiles().catch(err => {
  console.error("❌ 全体エラー:", err);
});