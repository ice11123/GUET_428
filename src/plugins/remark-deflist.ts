// remark-deflist — 将 Markdown 定义列表语法转为 HTML <dl>/<dt>/<dd>
// 语法：Term 行 + 换行 + 缩进冒号 : 或直接 : 开头的行为描述
// 标准 markdown 解析为连续的段落。此插件寻找 段落 + 以 ": " 开头的段落 模式。
export function remarkDeflist() {
  return (tree: any) => {
    transform(tree);
  };
}

function transform(tree: any) {
  if (!tree.children) return;

  const newChildren: any[] = [];
  let i = 0;

  while (i < tree.children.length) {
    const child = tree.children[i];

    // 寻找：一个段落（term）后紧跟至少一个以 ": " 开头的段落（description）
    if (
      child.type === 'paragraph' &&
      !isDefDescription(child) &&
      i + 1 < tree.children.length &&
      isDefDescription(tree.children[i + 1])
    ) {
      const terms: string[] = [renderInlineNodes(child.children)];
      const descriptions: string[] = [];
      i++;

      // 收集所有连续的 ": " 段落作为描述
      while (i < tree.children.length && isDefDescription(tree.children[i])) {
        const descPara = tree.children[i];
        const text = descPara.children[0]?.value || '';
        // 去掉开头的 ": " 或 ":  "
        const cleanText = text.replace(/^:\s+/, '');
        // 重新渲染描述段落的内联节点
        if (descPara.children.length === 1 && descPara.children[0].type === 'text') {
          descriptions.push(escapeHtml(cleanText));
        } else {
          // 如果描述包含内联元素，手动处理
          const firstChild = descPara.children[0];
          if (firstChild?.type === 'text') {
            firstChild.value = firstChild.value.replace(/^:\s+/, '');
          }
          descriptions.push(renderInlineNodes(descPara.children));
        }
        i++;
      }

      // 构建 <dl> HTML
      const termsHtml = terms.map((t) => `<dt>${t}</dt>`).join('\n');
      const descsHtml = descriptions.map((d) => `<dd>${d}</dd>`).join('\n');
      newChildren.push({
        type: 'html',
        value: `<dl>\n${termsHtml}\n${descsHtml}\n</dl>`,
      });
      continue;
    }

    transform(child);
    newChildren.push(child);
    i++;
  }

  tree.children = newChildren;
}

function isDefDescription(node: any): boolean {
  if (node.type !== 'paragraph' || !node.children?.length) return false;
  const first = node.children[0];
  if (first.type === 'text') {
    return /^:\s+/.test(first.value);
  }
  return false;
}

function renderInlineNodes(nodes: any[]): string {
  if (!nodes) return '';
  return nodes
    .map((node: any) => {
      if (node.type === 'text') return escapeHtml(node.value);
      if (node.type === 'inlineCode') return `<code>${escapeHtml(node.value)}</code>`;
      if (node.type === 'strong') return `<strong>${renderInlineNodes(node.children)}</strong>`;
      if (node.type === 'emphasis') return `<em>${renderInlineNodes(node.children)}</em>`;
      if (node.type === 'delete') return `<del>${renderInlineNodes(node.children)}</del>`;
      if (node.type === 'link') {
        const href = escapeHtml(node.url || '');
        const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
        return `<a href="${href}"${title}>${renderInlineNodes(node.children)}</a>`;
      }
      if (node.type === 'html') return node.value;
      if (node.children) return renderInlineNodes(node.children);
      return '';
    })
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
