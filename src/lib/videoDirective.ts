// ::video 指令的语法定义与纯解析逻辑，构建期与管理台预览共用。

const PRELOAD_VALUES = new Set(['metadata', 'none', 'auto']);
const DIRECTIVE_PATTERN = /^::video\[([^\]]+)\](?:\{([^}]*)\})?$/;
const EXTERNAL_REFERENCE_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/|\/)/i;

export function isExternalReference(reference: string): boolean {
  return EXTERNAL_REFERENCE_PATTERN.test(reference);
}

/** 相对引用在仓库中的源文件路径（不含站点 base）；外部地址返回 null。 */
export function videoSourcePath(reference: string, sourceDir: string): string | null {
  if (isExternalReference(reference)) return null;
  const segments = `${sourceDir}/${reference}`.split('/').filter((segment) => segment && segment !== '.');
  return `/${segments.map(encodeURIComponent).join('/')}`;
}

export interface VideoDirective {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  width?: string;
  height?: string;
  preload?: string;
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  playsinline?: boolean;
}

/** 逐行处理独占一行的 ::video 指令，自动跳过围栏代码块里的示例。 */
export function replaceVideoDirectives(source: string, replace: (raw: string) => string): string {
  let fence: string | null = null;

  return source
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
        return line;
      }
      if (marker) {
        fence = marker[1];
        return line;
      }
      const trimmed = line.trim();
      return trimmed.startsWith('::video[') ? replace(trimmed) : line;
    })
    .join('\n');
}

export function parseVideoDirective(raw: string): VideoDirective {
  const match = raw.trim().match(DIRECTIVE_PATTERN);
  if (!match) {
    throw new Error(`格式应为 ::video[相对路径] 或 ::video[相对路径]{属性, 属性}，实际为 ${raw.trim()}`);
  }

  const src = match[1].trim();
  if (!src) throw new Error('缺少视频文件路径');

  const directive: VideoDirective = { src };
  if (match[2] === undefined) return directive;

  for (const entry of match[2].split(',')) {
    const item = entry.trim();
    if (!item) continue;

    const separator = item.indexOf('=');
    if (separator < 0) {
      switch (item) {
        case 'loop': directive.loop = true; break;
        case 'muted': directive.muted = true; break;
        case 'autoplay': directive.autoplay = true; break;
        case 'controls': directive.controls = true; break;
        case 'playsinline': directive.playsinline = true; break;
        default: throw new Error(`未知属性 ${item}`);
      }
      continue;
    }

    const key = item.slice(0, separator).trim();
    const value = unquote(item.slice(separator + 1).trim());
    if (!value) throw new Error(`属性 ${key} 缺少取值`);

    if (key === 'poster') directive.poster = value;
    else if (key === 'title') directive.title = value;
    else if (key === 'class') directive.className = value;
    else if (key === 'width' || key === 'height') {
      if (!/^[1-9]\d*$/.test(value)) throw new Error(`属性 ${key} 必须是正整数，实际为 ${value}`);
      if (key === 'width') directive.width = value;
      else directive.height = value;
    } else if (key === 'preload') {
      if (!PRELOAD_VALUES.has(value)) throw new Error(`属性 preload 只能是 metadata、none 或 auto，实际为 ${value}`);
      directive.preload = value;
    } else {
      throw new Error(`未知属性 ${key}`);
    }
  }

  return directive;
}

function unquote(value: string): string {
  const match = value.match(/^(["'])([\s\S]*)\1$/);
  return match ? match[2] : value;
}

/** 生成 <video> 标记；路径到 URL 的解析由调用方注入。 */
export function renderVideoElement(directive: VideoDirective, resolveUrl: (reference: string) => string): string {
  const attributes = ['controls', 'playsinline', `preload="${escapeHtml(directive.preload ?? 'metadata')}"`];
  if (directive.loop) attributes.push('loop');
  if (directive.muted) attributes.push('muted');
  if (directive.autoplay) attributes.push('autoplay');
  if (directive.className) attributes.push(`class="${escapeHtml(directive.className)}"`);
  if (directive.width) attributes.push(`width="${escapeHtml(directive.width)}"`);
  if (directive.height) attributes.push(`height="${escapeHtml(directive.height)}"`);
  if (directive.title) attributes.push(`title="${escapeHtml(directive.title)}"`);
  if (directive.poster) attributes.push(`poster="${escapeHtml(resolveUrl(directive.poster))}"`);
  return `<video ${attributes.join(' ')} src="${escapeHtml(resolveUrl(directive.src))}"></video>`;
}

function escapeHtml(value: string): string {
  const replacements: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, (char) => replacements[char]);
}
