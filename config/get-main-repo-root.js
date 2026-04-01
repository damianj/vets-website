const fs = require('fs');
const path = require('path');

/**
 * Resolve the main repo root, handling git worktrees where the working
 * copy lives outside the main repo directory. In a worktree, .git is a
 * file pointing back to the real repo's .git folder; we follow that
 * pointer to find vets-website/.
 */
function getMainRepoRoot() {
  const root = path.resolve(__dirname, '..');
  const gitPath = path.join(root, '.git');
  try {
    if (fs.statSync(gitPath).isFile()) {
      const content = fs.readFileSync(gitPath, 'utf-8').trim();
      const match = content.match(/^gitdir:\s+(.+)$/);
      if (match) {
        const commondir = fs
          .readFileSync(path.join(match[1], 'commondir'), 'utf-8')
          .trim();
        return path.resolve(match[1], commondir, '..');
      }
    }
  } catch {
    /* not a worktree — use default */
  }
  return root;
}

module.exports = getMainRepoRoot;
