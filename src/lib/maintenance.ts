import { createMarkdownProcessor } from '@astrojs/markdown-remark';

export interface MaintenanceEntry {
  date: string;
  title: string;
  html: string;
}

const ENTRY_HEADING = /^##\s+(\d{4}-\d{2}-\d{2})｜(.+)$/gm;

export async function parseMaintenance(source: string): Promise<MaintenanceEntry[]> {
  const matches = [...source.matchAll(ENTRY_HEADING)];
  const processor = await createMarkdownProcessor({
    gfm: true,
    syntaxHighlight: false,
    rehypePlugins: [stripRawHtml],
  });

  return Promise.all(matches.map(async (match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const body = source.slice(start, end).trim();
    const rendered = await processor.render(body);
    return {
      date: match[1],
      title: match[2].trim(),
      html: rendered.code,
    };
  }));
}

function stripRawHtml() {
  return (tree: any) => {
    const clean = (node: any) => {
      if (!Array.isArray(node?.children)) return;
      node.children = node.children.filter((child: any) => child?.type !== 'raw');
      node.children.forEach(clean);
    };
    clean(tree);
  };
}
