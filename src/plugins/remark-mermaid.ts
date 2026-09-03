// 将 ```mermaid 代码块转为 HTML <pre class="mermaid">（在 remark 阶段处理，早于 expressive-code）
export function remarkMermaid() {
  return (tree: any) => {
    visit(tree);
  };
}

function visit(node: any) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'code' && node.lang === 'mermaid') {
    // 将 mermaid 代码块替换为 raw HTML 节点，后续管道不做转义
    node.type = 'html';
    node.value = `<pre class="mermaid">${node.value}</pre>`;
    delete node.lang;
    delete node.meta;
    return;
  }
  if (node.children) {
    for (const child of node.children) {
      visit(child);
    }
  }
}
