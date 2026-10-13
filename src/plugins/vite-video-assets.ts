// 把文章引用到的视频与封面图原样写进构建产物，访问地址与开发服务器一致。
import { readFileSync } from 'node:fs';
import { collectVideoAssetPaths, videoAssetOutputPath } from './video-assets.ts';

export interface ViteVideoAssetsOptions {
  /** 仓库根目录，默认取当前工作目录。 */
  rootDir?: string;
}

export function viteVideoAssets(options: ViteVideoAssetsOptions = {}) {
  const rootDir = options.rootDir ?? process.cwd();

  return {
    name: 'astro-video-assets',
    apply: 'build',
    buildStart(this: any) {
      for (const absolutePath of collectVideoAssetPaths(rootDir)) {
        this.emitFile({
          type: 'asset',
          fileName: videoAssetOutputPath(absolutePath, rootDir),
          source: readFileSync(absolutePath),
        });
      }
    },
  };
}
