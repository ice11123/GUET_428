// remark-sub-super — 将 ~text~ 转为 <sub>，^text^ 转为 <sup>
// 在 remark 阶段后处理文本节点，用 HTML 节点替换

export function remarkSubSuper() {
  return (tree: any) => {
    transform(tree);
  };
}

function transform(node: any) {
  if (!node || typeof node !== 'object') return;
  if (node.children) {
    const newChildren: any[] = [];
    for (const child of node.children) {
      if (child.type === 'text') {
        // 在一个文本节点中搜索 ~text~ 和 ^text^ 模式
        const parts = parseSubSuper(child.value);
        if (parts.length > 1) {
          for (const part of parts) {
            newChildren.push(part);
          }
          continue;
        }
      }
      transform(child);
      newChildren.push(child);
    }
    node.children = newChildren;
  }
}

function parseSubSuper(text: string): any[] {
  const result: any[] = [];

  // 匹配 ~text~ (sub) 和 ^text^ (sup)，但不能是 ~~ 或 ^^ 等转义情况
  // 规则：单个 ~ 或 ^ 包裹内容，内容不能为空
  let i = 0;
  let current = '';

  while (i < text.length) {
    const char = text[i];

    // 检查 sub: ~text~
    if (char === '~' && !isEscaped(text, i)) {
      const end = text.indexOf('~', i + 1);
      // 确保不是 ~~ (strikethrough)，且内容不为空
      if (end !== -1 && end > i + 1 && text[i + 1] !== '~') {
        if (current) {
          result.push({ type: 'text', value: current });
          current = '';
        }
        result.push({
          type: 'html',
          value: `<sub>${escapeHtml(text.slice(i + 1, end))}</sub>`,
        });
        i = end + 1;
        continue;
      }
    }

    // 检查 sup: ^text^
    if (char === '^' && !isEscaped(text, i)) {
      const end = text.indexOf('^', i + 1);
      // 确保内容不为空，且下一个字符不是 ^
      if (end !== -1 && end > i + 1 && text[i + 1] !== '^') {
        if (current) {
          result.push({ type: 'text', value: current });
          current = '';
        }
        result.push({
          type: 'html',
          value: `<sup>${escapeHtml(text.slice(i + 1, end))}</sup>`,
        });
        i = end + 1;
        continue;
      }
    }

    current += char;
    i++;
  }

  if (current) {
    result.push({ type: 'text', value: current });
  }

  return result;
}

function isEscaped(text: string, index: number): boolean {
  let backslashes = 0;
  let i = index - 1;
  while (i >= 0 && text[i] === '\\') {
    backslashes++;
    i--;
  }
  return backslashes % 2 === 1;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
