import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { EXT_MAP, BINARY_EXTS, SKIP_FILES } from '../consts';

export interface RepoLanguage {
  name: string;
  lines: number;
  percentage: number;
  color: string;
}

export function getRepoLanguages(): { repoLanguages: RepoLanguage[]; totalRepoLines: number } {
  const langLines: Record<string, { lines: number; color: string }> = {};

  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    const files = output.trim().split('\n');

    for (const file of files) {
      const base = file.split('/').pop() || '';
      if (SKIP_FILES.has(base)) continue;
      const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
      if (BINARY_EXTS.has(ext)) continue;

      let info = EXT_MAP[ext];
      if (!info && base === 'Dockerfile') info = { name: 'Dockerfile', color: '#384d54' };
      if (!info) continue;

      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim() !== '').length;
        if (!langLines[info.name]) langLines[info.name] = { lines: 0, color: info.color };
        langLines[info.name]!.lines += lines;
      } catch {
        // skip unreadable files
      }
    }

    const totalRepoLines = Object.values(langLines).reduce((s, v) => s + v.lines, 0);
    const repoLanguages = Object.entries(langLines)
      .map(([name, data]) => ({
        name,
        lines: data.lines,
        percentage: totalRepoLines > 0 ? Math.round((data.lines / totalRepoLines) * 100) : 0,
        color: data.color,
      }))
      .filter(l => l.percentage > 0)
      .sort((a, b) => b.lines - a.lines);

    return { repoLanguages, totalRepoLines };
  } catch {
    return { repoLanguages: [], totalRepoLines: 0 };
  }
}
