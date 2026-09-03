import { defineEcConfig } from 'astro-expressive-code';

const SYNTAX_CSS_VARS = {
  editorForeground: 'var(--foreground)',
  keyword: 'var(--syn-keyword)',
  string: 'var(--syn-string)',
  function: 'var(--syn-function)',
  comment: 'var(--syn-comment)',
  number: 'var(--syn-number)',
  variable: 'var(--foreground)',
  type: 'var(--syn-type)',
  punctuation: 'var(--syn-punctuation)',
};

export default defineEcConfig({
  themes: ['github-dark', 'github-light'],
  minSyntaxHighlightingColorContrast: 0,
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => {
    if (theme.name === 'github-light') {
      return `[data-theme^="light"]`;
    }
    return `[data-theme='${theme.name}']`;
  },
  customizeTheme: (theme) => {
    const scopeMap = [
      { test: /\bcomment\b/, v: SYNTAX_CSS_VARS.comment },
      { test: /\bdoc\b/, v: SYNTAX_CSS_VARS.comment },
      { test: /\bstring\b/, v: SYNTAX_CSS_VARS.string },
      { test: /\bkeyword\b/, v: SYNTAX_CSS_VARS.keyword },
      { test: /\bfunction\b/, v: SYNTAX_CSS_VARS.function },
      { test: /\bsupport\.function\b/, v: SYNTAX_CSS_VARS.function },
      { test: /\bnumber\b/, v: SYNTAX_CSS_VARS.number },
      { test: /\bvariable\b/, v: SYNTAX_CSS_VARS.variable },
      { test: /\btype\b/, v: SYNTAX_CSS_VARS.type },
      { test: /\bpunctuation\b/, v: SYNTAX_CSS_VARS.punctuation },
      { test: /\bentity\.name\b/, v: SYNTAX_CSS_VARS.function },
      { test: /\bentity\.other\b/, v: SYNTAX_CSS_VARS.variable },
      { test: /\bstorage\.type\b/, v: SYNTAX_CSS_VARS.keyword },
      { test: /\bstorage\.modifier\b/, v: SYNTAX_CSS_VARS.keyword },
      { test: /\bconstant\b/, v: SYNTAX_CSS_VARS.number },
      { test: /\bparameter\b/, v: SYNTAX_CSS_VARS.variable },
    ];

    theme.settings.forEach(setting => {
      if (!setting.settings.foreground) return;
      const scope = Array.isArray(setting.scope)
        ? setting.scope.join(',')
        : (setting.scope || '');

      for (const { test, v } of scopeMap) {
        if (test.test(scope)) {
          setting.settings.foreground = v;
          return;
        }
      }
      setting.settings.foreground = SYNTAX_CSS_VARS.editorForeground;
    });

    if (theme.colors) {
      theme.colors['editor.foreground'] = SYNTAX_CSS_VARS.editorForeground;
    }
    return theme;
  },

  styleOverrides: {
    borderRadius: '8px',
    borderColor: 'var(--border)',
    codeBackground: 'var(--muted-dark)',
    codeForeground: 'var(--foreground)',
    codeFontSize: '0.85rem',
    codePaddingBlock: '1rem',
    codePaddingInline: '1.35rem',
    gutterBorderColor: 'var(--border)',
    gutterForeground: 'var(--foreground-dark)',
    uiFontSize: '0.85rem',
    scrollbarThumbColor: 'var(--scrollbar-thumb)',
    frames: {
      editorBackground: 'var(--muted-dark)',
      terminalBackground: 'var(--muted-dark)',
      terminalTitleBarBackground: 'var(--muted-dark)',
      frameBoxShadowCssValue: 'none',
    },
  },
});
