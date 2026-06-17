import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const corePackagePath = path.join(root, 'packages/@translaas/core/package.json');
const { version } = JSON.parse(readFileSync(corePackagePath, 'utf8'));
const tag = `v${version}`;

function remoteTagExists(tagName) {
  try {
    const output = execSync(`git ls-remote --tags origin ${tagName}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return output.includes(`refs/tags/${tagName}`);
  } catch {
    return false;
  }
}

if (remoteTagExists(tag)) {
  console.log(`Tag ${tag} already exists on origin; skipping coordinated release tag.`);
  process.exit(0);
}

execSync(`git tag ${tag}`, { cwd: root, stdio: 'inherit' });
execSync(`git push origin ${tag}`, { cwd: root, stdio: 'inherit' });
console.log(`Created and pushed coordinated release tag ${tag}`);
