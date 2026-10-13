// 把 Markdown 中的 ::video 指令渲染为 <video>，并把引用解析为可访问的资源地址。
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVideoDirective } from '../lib/videoDirective.ts';
import type { VideoDirective } from '../lib/videoDirective.ts';
import { POSTER_EXTENSIONS, VIDEO_EXTENSIONS, isExternalAsset, videoAssetUrl } from './video-assets.ts';

export interface RehypeVideoOptions {
  /** 站点 base，需与 Astro 的 base 保持一致。 */
  base?: string;
  /** 仓库根目录，用于把资源地址写成仓库相对路径。 */
  rootDir?: string;
}

interface VideoContext {
  base: string;
  rootDir: string;
  directory: string;
  filePath: string;
}

export function rehypeVideo(options: RehypeVideoOptions = {}) {
  // 写成 rehypeVideo({ base }) 时 unified 会把返回值当 attacher 再调用一次，导致整条插件静默失效。
  if (typeof (options as { use?: unknown }).use === 'function') {
    throw new Error('rehypeVideo 必须以 [rehypeVideo, { base }] 形式注册到 rehypePlugins');
  }

  const base = (options.base ?? '').replace(/\/+$/, '');
  const rootDir = options.rootDir ?? process.cwd();

  return (tree: any, file: any) => {
    if (typeof file?.path !== 'string') return;
    const filePath = file.path.startsWith('file://') ? fileURLToPath(file.path) : file.path;
    transform(tree, { base, rootDir, directory: path.dirname(filePath), filePath });
  };
}

function transform(node: any, context: VideoContext): void {
  if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;

  const children = node.children;
  for (let index = 0; index < children.length; index += 1) {
    const raw = videoDirectiveText(children[index]);
    if (raw === null) {
      transform(children[index], context);
      continue;
    }
    children[index] = buildVideoNode(raw, context);
  }
}

/** 只认独占段落的指令；段中出现的 ::video 按普通文字保留。 */
function videoDirectiveText(node: any): string | null {
  if (!node || node.type !== 'element' || node.tagName !== 'p') return null;
  const children = node.children;
  if (!Array.isArray(children) || children.length !== 1 || children[0]?.type !== 'text') return null;
  const value = String(children[0].value ?? '').trim();
  return value.startsWith('::video[') ? value : null;
}

function buildVideoNode(raw: string, context: VideoContext): unknown {
  try {
    return createVideoNode(raw, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`视频指令无法解析（${context.filePath}）：${message}`);
  }
}

function createVideoNode(raw: string, context: VideoContext): unknown {
  const directive: VideoDirective = parseVideoDirective(raw);
  const properties: Record<string, unknown> = {
    controls: true,
    playsinline: true,
    preload: directive.preload ?? 'metadata',
    src: resolveAssetUrl(directive.src, VIDEO_EXTENSIONS, '视频', context),
  };
  if (directive.loop) properties.loop = true;
  if (directive.muted) properties.muted = true;
  if (directive.autoplay) properties.autoplay = true;
  if (directive.title) properties.title = directive.title;
  if (directive.className) properties.className = directive.className;
  if (directive.width) properties.width = directive.width;
  if (directive.height) properties.height = directive.height;
  if (directive.poster) properties.poster = resolveAssetUrl(directive.poster, POSTER_EXTENSIONS, '封面图', context);

  return { type: 'element', tagName: 'video', properties, children: [] };
}

function resolveAssetUrl(reference: string, extensions: string[], label: string, context: VideoContext): string {
  if (isExternalAsset(reference)) return reference;

  const extension = path.extname(reference).toLowerCase();
  if (!extensions.includes(extension)) {
    throw new Error(`${label}扩展名不受支持：${reference}（可用 ${extensions.join('、')}）`);
  }

  const absolutePath = path.resolve(context.directory, reference);
  if (!existsSync(absolutePath)) {
    throw new Error(`${label}文件不存在：${reference}（解析为 ${absolutePath}）`);
  }

  return videoAssetUrl(absolutePath, context.base, context.rootDir);
}
