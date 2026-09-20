import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkDefinitionList, { defListHastHandlers } from 'remark-definition-list';
import rehypeKatex from 'rehype-katex';
import expressiveCode from 'astro-expressive-code';

import tailwindcss from '@tailwindcss/vite';

import remarkEmoji from 'remark-emoji';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remarkMark } from 'remark-mark-highlight';
import { unified } from '@astrojs/markdown-remark';

import compress from 'astro-compress';
import { remarkMermaid } from './src/plugins/remark-mermaid';
import { remarkGithubAlerts } from './src/plugins/remark-github-alerts';
import { remarkSubSuper } from './src/plugins/remark-sub-super';

const siteUrl = process.env.SITE_URL?.trim() || 'https://ice11123.github.io';
const basePath = process.env.SITE_BASE?.trim() || '/GUET_428';
const redirectBasePath = basePath === '/' ? '' : `/${basePath.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site: siteUrl,
  base: basePath,
  outDir: './dist',
  redirects: {
    '/blog/博客功能介绍与演示/欢迎使用': `${redirectBasePath}/blog/其他/欢迎使用/`,
    '/blog/小车组/新生入门/01-ti-car-start': `${redirectBasePath}/blog/小车组/ti小车实战/01-ti-car-start/`,
    '/blog/小车组/新生入门/02-system-architecture': `${redirectBasePath}/blog/小车组/ti小车实战/02-system-architecture/`,
    '/blog/小车组/新生入门/03-first-motor-run': `${redirectBasePath}/blog/小车组/ti小车实战/03-first-motor-run/`,
    '/blog/小车组/pid算法/01-pid-algorithms': `${redirectBasePath}/blog/小车组/pid算法/01-positional-incremental-pid/`,
    '/blog/小车组/灰度及循迹环pid/01-line-tracking-control': `${redirectBasePath}/blog/小车组/灰度及循迹环pid/01-eight-channel-tracker/`,
    '/blog/小车组/滤波算法与陀螺仪驱动/01-filtering-and-imu-drivers': `${redirectBasePath}/blog/小车组/滤波算法与陀螺仪驱动/01-kalman-fusion-design/`,
  },

  integrations: [
    expressiveCode(),
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/admin/'),
    }),
    compress({
      HTML: {
        'html-minifier-terser': {
          conservativeCollapse: true,
        },
      },
    }),
  ],

  markdown: {
    processor: unified({
      remarkPlugins: [
        [remarkGfm, { singleTilde: false }],
        remarkDefinitionList,
        remarkEmoji,
        remarkMath,
        remarkMark,
        remarkSubSuper,
        remarkGithubAlerts,
        remarkMermaid,
      ],
      rehypePlugins: [
        [rehypeKatex, { output: 'html' }],
        rehypeSlug,
        rehypeAutolinkHeadings,
      ],
      remarkRehype: {
        handlers: defListHastHandlers,
      },
    }),
    syntaxHighlight: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
