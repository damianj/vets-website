const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { execSync } = require('child_process');

// list of forms-system files changed in this PR
const files = (process.env.CHANGED_FILES || '')
  .split(' ')
  .filter(f => f.includes('platform/forms-system/'))
  .filter(f => /\.(js|jsx|ts|tsx)$/.test(f));

// make sure we set the path to vets-website
const repoRoot = execSync('git rev-parse --show-toplevel', {
  encoding: 'utf8',
  cwd: __dirname,
}).trim();

// max workers for each job
const MAX_WORKERS = 12;

// find all exports from changed forms-system files changed in this PR
function getExports() {
  const exports = [];
  for (const file of files) {
    let source;
    try {
      source = fs.readFileSync(file, 'utf8');
    } catch {
      // if a file is deleted in a PR there will be an ENOENT error
      // this is ok - any errors the deleted file might cause will be caught in the CI build step
    }

    if (source) {
      const ast = parser.parse(source, {
        sourceType: 'module',
        plugins: ['jsx', 'optionalChaining', 'nullishCoalescingOperator'],
      });

      traverse(ast, {
        ExportNamedDeclaration({ node }) {
          const { declaration, specifiers } = node;
          if (declaration?.declarations) {
            declaration.declarations.forEach(d => exports.push(d.id.name));
          } else if (declaration?.id) {
            exports.push(declaration.id.name);
          }
          specifiers?.forEach(s => exports.push(s.exported.name));
        },
        ExportDefaultDeclaration({ node }) {
          const { declaration } = node;
          exports.push(declaration.id ? declaration.id.name : 'default');
        },
      });
    }
  }
  return exports;
}

// make sure that a file really imports something from forms-system
function checkFileHasFormSystemImports(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'optionalChaining', 'nullishCoalescingOperator'],
  });

  let hasFormSystemImport = false;
  traverse(ast, {
    ImportDeclaration({ node }) {
      if (node.source.value.includes('forms-system')) {
        hasFormSystemImport = true;
      }
    },
  });

  return hasFormSystemImport;
}

// find files that import something from one of the files changed in the PR
function getFilesUsingExports() {
  const exports = getExports();
  const importingFiles = new Set();

  // first find files that might import a forms-system export by searching by name
  for (const _export of exports) {
    try {
      const hits = execSync(`git grep -l "${_export}" -- src`, {
        encoding: 'utf8',
        cwd: repoRoot,
      })
        .trim()
        .split('\n')
        .filter(Boolean);
      hits.forEach(hit => {
        // now verify the file does in fact import something from forms-system
        if (checkFileHasFormSystemImports(hit)) {
          importingFiles.add(hit);
        }
      });
    } catch {
      // no match found
    }
  }

  return importingFiles;
}

// find the parent app folder
function findAppFolder(filePath) {
  let dir = path.dirname(filePath);

  const terminalDir = 'src/applications';

  let folder = null;
  while (!dir.endsWith(terminalDir)) {
    // possible path to app's manifest
    const manifestPath = path.join(repoRoot, dir, 'manifest.json');
    // we found it
    if (fs.existsSync(manifestPath)) {
      folder = dir;
      break;
    }

    const nextDir = path.dirname(dir);
    // we tried all parent dirs up to /applications but did not find manifest.json, so take app folder
    if (nextDir.endsWith(terminalDir)) {
      folder = dir;
      break;
    }
    dir = nextDir;
  }
  return folder;
}

// find the parent platform folder
function findPlatformFolder(filePath) {
  const segments = filePath.split(path.sep);
  const idx = segments.indexOf('platform');
  return segments.slice(0, idx + 2).join(path.sep);
}

// find the folder that contains tests for a targeted app or platform folder
function findTestingFolder(filePath) {
  return filePath.includes('src/applications')
    ? findAppFolder(filePath)
    : findPlatformFolder(filePath);
}

// make sure that a potential testing folder has tests that can be run
function verifySpecsExistInFolder(folder, cypress = true) {
  const fullPath = path.join(repoRoot, folder);
  const nameArgs = cypress
    ? '-name "*.cypress.spec.js" -o -name "*.cypress.spec.jsx" -o -name "*.cypress.spec.ts" -o -name "*.cypress.spec.tsx"'
    : '-name "*.unit.spec.js" -o -name "*.unit.spec.jsx" -o -name "*.unit.spec.ts" -o -name "*.unit.spec.tsx"';

  try {
    const result = execSync(`find . -type f \\( ${nameArgs} \\) | head -1`, {
      encoding: 'utf8',
      cwd: fullPath,
    }).trim();
    return result.length > 0;
  } catch (e) {
    return false;
  }
}

// distribute apps evenly across max number of workers
function bucketFolders(apps, globSuffix) {
  const folderList = [...apps];
  const buckets = Array.from(
    { length: Math.min(folderList.length, MAX_WORKERS) },
    () => [],
  );
  folderList.forEach((folder, i) => buckets[i % buckets.length].push(folder));
  return buckets.map(b => b.map(f => `${f}/${globSuffix}`).join(','));
}

// Sets three GitHub Actions outputs:
// - folders: comma-separated list of app/platform folders (e.g. "src/applications/foo,src/platform/bar")
// - cypress_specs: JSON array of {index, spec} objects, bucketed across up to 12 workers for Cypress matrix
// - unit_test_specs: JSON array of {index, spec} objects, bucketed across up to 12 workers for unit test matrix
function getFoldersForTests() {
  const _files = getFilesUsingExports();
  const foldersWithCypressTests = new Set();
  const foldersWithUnitTests = new Set();
  _files.forEach(file => {
    const folder = findTestingFolder(file);
    if (folder) {
      if (verifySpecsExistInFolder(folder)) foldersWithCypressTests.add(folder);
      if (verifySpecsExistInFolder(folder, false))
        foldersWithUnitTests.add(folder);
    }
  });

  const cypressBuckets = bucketFolders(
    foldersWithCypressTests,
    '**/*.cypress.spec.{js,jsx,ts,tsx}',
  );
  const unitBuckets = bucketFolders(
    foldersWithUnitTests,
    '**/*.unit.spec.{js,jsx,ts,tsx}',
  );

  const hasCypressTests = foldersWithCypressTests.size > 0;
  const hasUnitTests = foldersWithUnitTests.size > 0;
  const cypressSpecs = JSON.stringify(
    cypressBuckets.map((spec, i) => ({ name: i, spec })),
  );
  const unitTestSpecs = JSON.stringify(
    unitBuckets.map((spec, i) => ({ name: i, spec })),
  );

  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `has_cypress_tests=${hasCypressTests}\nhas_unit_tests=${hasUnitTests}\ncypress_specs=${cypressSpecs}\nunit_test_specs=${unitTestSpecs}\n`,
  );
}

getFoldersForTests();
