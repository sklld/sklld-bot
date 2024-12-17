import { BLITZKIT_TANK_ICON_SIZE, fetchTankDefinitions } from '@blitzkit/core';
import { exec } from 'child_process';
import { launch } from 'puppeteer';
import sharp from 'sharp';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';

export async function blitzkitTankIcons() {
  console.log('Building tank icons...');

  const child = exec('cd ../.. && bun dev:website');
  const browser = await launch();
  const page = await browser.newPage();
  const tanks = Object.values((await fetchTankDefinitions()).tanks);
  const files: FileChange[] = [];

  let index = 0;
  for (const { id, name } of tanks) {
    await page.setViewport({
      width: BLITZKIT_TANK_ICON_SIZE.width - 1,
      height: BLITZKIT_TANK_ICON_SIZE.height,
    });
    await page.goto(`http://localhost:4321/api/tankopedia/tank-icon/${id}/`, {
      waitUntil: 'networkidle0',
    });
    const screenshot = await page.screenshot({
      type: 'webp',
      omitBackground: true,
    });
    const content = await sharp(screenshot).trim({ threshold: 100 }).toBuffer();

    index++;
    console.log(
      `Rendered ${id} (${name}) ${((index / tanks.length) * 100).toFixed(2)}%`,
    );

    files.push({ path: `icons/tanks/blitzkit/${id}.webp`, content });
  }

  child.kill('SIGHUP');
  await browser.close();

  await commitAssets('tank icons', files);
}
