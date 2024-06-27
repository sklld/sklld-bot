import { times } from 'lodash';
import { decompress } from 'lz4js';
import { DiscoverIdsManifest } from '../../../scripts/discoverIds';
import { DidsReadStream } from '../streams/dids';
import { asset } from './asset';

export async function fetchPreDiscoveredIds(dev: boolean) {
  const idChunks: number[][] = [];
  const preDiscoveredManifest = (await fetch(
    asset('ids/manifest.json', dev),
  ).then((response) => response.json())) as DiscoverIdsManifest;

  console.log(
    `Fetching ${preDiscoveredManifest.chunks} pre-discovered chunks...`,
  );

  await Promise.all(
    times(preDiscoveredManifest.chunks, async (chunkIndex) => {
      const preDiscovered = await fetch(
        asset(`ids/${chunkIndex}.dids.lz4`, dev),
      ).then(async (response) => {
        const buffer = await response.arrayBuffer();
        const decompressed = decompress(new Uint8Array(buffer)).buffer;
        return new DidsReadStream(decompressed as ArrayBuffer).dids();
      });

      // no spread syntax: https://github.com/oven-sh/bun/issues/11734
      idChunks.push(preDiscovered);

      console.log(
        `Pre-discovered ${preDiscovered.length} ids (chunk ${chunkIndex})`,
      );
    }),
  );

  return idChunks.sort((a, b) => a[0] - b[0]).flat();
}
