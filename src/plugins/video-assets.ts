// ::video 引用的资源解析：构建期与打包期共用同一套路径规则。
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { isExternalReference, parseVideoDirective, replaceVideoDirectives } from '../lib/videoDirective.ts';

export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];
export const POSTER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'];

export const isExternalAsset = isExternalReference;

const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const SOURCE_DIRECTORY = 'src';

/** 解析引用的绝对路径；外部地址与站点绝对路径返回 null，交由浏览器直接请求。 */
export function resolveVideoReference(reference: string, directory: string): string | null {
  return isExternalAsset(reference) ? null : path.resolve(directory, reference);
}

/** 仓库相对路径形式的访问地址：开发服务器直接提供源文件，构建时原样落盘。 */
export function videoAssetUrl(absolutePath: string, base: string, rootDir: string): string {
  const segments = path.relative(rootDir, absolutePath).split(path.sep).map(encodeURIComponent);
  return `${base}/${segments.join('/')}`;
}

/** 资源在构建产物中的落盘位置，与访问地址保持一致。 */
export function videoAssetOutputPath(absolutePath: string, rootDir: string): string {
  return path.relative(rootDir, absolutePath).split(path.sep).join('/');
}

export function extractVideoReferences(source: string): string[] {
  const references: string[] = [];
  replaceVideoDirectives(source, (raw) => {
    try {
      const directive = parseVideoDirective(raw);
      references.push(directive.src);
      if (directive.poster) references.push(directive.poster);
    } catch {
      // 语法错误由 rehype 插件在渲染时报出，这里只收集可解析的引用。
    }
    return raw;
  });
  return references;
}

/** 扫描文章目录，返回所有需要打包且确实存在的资源绝对路径。 */
export function collectVideoAssetPaths(rootDir: string): string[] {
  const found = new Set<string>();
  for (const file of walkMarkdown(path.join(rootDir, SOURCE_DIRECTORY))) {
    const directory = path.dirname(file);
    for (const reference of extractVideoReferences(readFileSync(file, 'utf8'))) {
      const absolutePath = resolveVideoReference(reference, directory);
      if (absolutePath && existsSync(absolutePath)) found.add(absolutePath);
    }
  }
  return [...found];
}

function walkMarkdown(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkMarkdown(target));
    else if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(target);
  }
  return files;
}
