const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const repoDir = path.resolve(__dirname, '..');

async function run() {
  console.log('Initializing Git repo at:', repoDir);
  await git.init({ fs, dir: repoDir, defaultBranch: 'main' });

  // List all files recursively excluding node_modules, dist, .git
  function getFiles(dir, baseDir = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (['node_modules', 'dist', '.git', '.system_generated'].includes(entry.name)) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(baseDir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(repoDir);
  console.log(`Adding ${filesToAdd.length} files...`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir: repoDir, filepath });
  }

  const commitSha = await git.commit({
    fs,
    dir: repoDir,
    author: {
      name: 'tanmayi-vn',
      email: 'tanmayi@users.noreply.github.com',
    },
    message: 'feat: Initial release of CatchUp AI - Less scrolling. More knowing.',
  });

  console.log('Committed successfully. SHA:', commitSha);

  // Set remote origin
  await git.setConfig({
    fs,
    dir: repoDir,
    path: 'remote.origin.url',
    value: 'https://github.com/tanmayi-vn/protocolx.git',
  });

  await git.setConfig({
    fs,
    dir: repoDir,
    path: 'remote.origin.fetch',
    value: '+refs/heads/*:refs/remotes/origin/*',
  });

  console.log('Configured remote origin: https://github.com/tanmayi-vn/protocolx.git');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
