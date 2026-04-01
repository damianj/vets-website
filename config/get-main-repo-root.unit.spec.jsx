const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');

const getMainRepoRoot = require('./get-main-repo-root');

describe('getMainRepoRoot', () => {
  const configDir = path.resolve(__dirname);
  const defaultRoot = path.resolve(configDir, '..');

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns the default root when .git is a directory', () => {
    sandbox.stub(fs, 'statSync').returns({ isFile: () => false });

    expect(getMainRepoRoot()).to.equal(defaultRoot);
  });

  it('resolves the main repo root when running in a worktree', () => {
    const fakeGitDir = '/home/user/dev/vets-website/.git/worktrees/my-branch';
    const fakeCommonDir = '../../';

    sandbox.stub(fs, 'statSync').returns({ isFile: () => true });
    sandbox
      .stub(fs, 'readFileSync')
      .withArgs(path.join(defaultRoot, '.git'), 'utf-8')
      .returns(`gitdir: ${fakeGitDir}\n`)
      .withArgs(path.join(fakeGitDir, 'commondir'), 'utf-8')
      .returns(`${fakeCommonDir}\n`);

    const expectedRoot = path.resolve(fakeGitDir, fakeCommonDir, '..');

    expect(getMainRepoRoot()).to.equal(expectedRoot);
  });

  it('returns the default root when .git file has no gitdir line', () => {
    sandbox.stub(fs, 'statSync').returns({ isFile: () => true });
    sandbox.stub(fs, 'readFileSync').returns('something unexpected');

    expect(getMainRepoRoot()).to.equal(defaultRoot);
  });

  it('returns the default root when fs operations throw', () => {
    sandbox.stub(fs, 'statSync').throws(new Error('ENOENT'));

    expect(getMainRepoRoot()).to.equal(defaultRoot);
  });
});
