// remark-footnotes — 处理 [^id] 脚注引用和 [^id]: 脚注定义
export function remarkFootnotes() {
  return (tree: any) => {
    transform(tree);
  };
}

interface FootnoteDef {
  id: string;
  content: string;
  index: number;
}

function transform(tree: any) {
  if (!tree.children) return;

  // 第一遍：收集脚注定义
  const definitions: FootnoteDef[] = [];
  const nodesToRemove: number[] = [];

  for (let i = 0; i < tree.children.length; i++) {
    const child = tree.children[i];
    if (child.type === 'paragraph' && child.children?.length === 1 && child.children[0].type === 'text') {
      const text = child.children[0].value;
      const match = text.match(/^\[(\^[^\]]+)\]:\s*(.*)/s);
      if (match) {
        definitions.push({
          id: match[1],
          content: match[2].trim(),
          index: definitions.length,
        });
        nodesToRemove.push(i);
      }
    }
    // 也可能在定义列表格式中 [^id]:\n  多行内容
    if (child.type === 'definition') {
      if (child.identifier?.startsWith('^')) {
        definitions.push({
          id: child.identifier,
          content: child.label || child.url || child.title || '',
          index: definitions.length,
        });
        nodesToRemove.push(i);
      }
    }
  }

  // 删除脚注定义节点（从后往前删）
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    tree.children.splice(nodesToRemove[i], 1);
  }

  if (definitions.length === 0) return;

  // 第二遍：在所有段落和文本中替换 [^id] 为脚注引用
  replaceFootnoteRefs(tree, definitions);

  // 第三遍：在文档末尾添加脚注区域
  const footnotesHtml = buildFootnotesHtml(definitions);
  tree.children.push({ type: 'html', value: footnotesHtml });
}

function replaceFootnoteRefs(node: any, definitions: FootnoteDef[]) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'text') {
    // 替换文本中的 [^id]
    const pattern = /\[\^([^\]]+)\]/g;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(node.value)) !== null) {
      const def = definitions.find((d) => d.id === match![1]);
      if (def) {
        result += escapeHtml(node.value.slice(lastIndex, match.index));
        result += `<sup class="footnote-ref"><a id="fnref-${def.index + 1}" href="#fn-${def.index + 1}">[${def.index + 1}]</a></sup>`;
        lastIndex = pattern.lastIndex;
      }
    }

    if (result) {
      result += escapeHtml(node.value.slice(lastIndex));
      node.type = 'html';
      node.value = result;
      delete node.children;
    }
    return;
  }

  if (node.children) {
    // 对于段落节点，需要将 text 子节点替换为可能包含 html 的节点
    const newChildren: any[] = [];
    let replacedAny = false;
    for (const child of node.children) {
      if (child.type === 'text') {
        const pattern = /\[\^([^\]]+)\]/g;
        let text = child.value;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(text)) !== null) {
          const def = definitions.find((d) => d.id === match![1]);
          if (def) {
            // 添加前面的文本
            if (match.index > lastIndex) {
              newChildren.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            newChildren.push({
              type: 'html',
              value: `<sup class="footnote-ref"><a id="fnref-${def.index + 1}" href="#fn-${def.index + 1}">[${def.index + 1}]</a></sup>`,
            });
            lastIndex = pattern.lastIndex;
            replacedAny = true;
          }
        }

        if (lastIndex > 0) {
          // 有替换发生
          if (lastIndex < text.length) {
            newChildren.push({ type: 'text', value: text.slice(lastIndex) });
          }
        } else {
          newChildren.push(child);
        }
      } else {
        replaceFootnoteRefs(child, definitions);
        newChildren.push(child);
      }
    }
    if (replacedAny) {
      node.children = newChildren;
    }
  }
}

function buildFootnotesHtml(definitions: FootnoteDef[]): string {
  const items = definitions
    .map(
      (def) =>
        `<li id="fn-${def.index + 1}">
  <a href="#fnref-${def.index + 1}" class="footnote-backref">&#8617;</a>
  <span>${escapeHtml(def.content)}</span>
</li>`
    )
    .join('\n');

  return `<div class="footnotes">
<hr>
<ol>
${items}
</ol>
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
