import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

const inputByGoxzFlag = {
  arch:            'arch',
  os:              'os',
  'build-ldflags': 'ldflags',
  'build-tags':    'tags',
  d:               'dest',
  n:               'name',
};

async function run() {
  try {
    const goxzVersion = core.getInput('goxz-version');
    const goxzPath = await getGoxzPath(goxzVersion);

    await exec.exec(goxzPath, [
      ...buildFlags(),
      core.getInput("package"),
    ]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getGoxzPath(version: string): Promise<string> {
  const toolPath = tc.find('goxz', version) || await downloadGoxz(version);
  core.debug(`contained entries: ${fs.readdirSync(toolPath)}`);
  return path.join(toolPath, getArchiveName(version), "goxz");
}

async function downloadGoxz(version: string): Promise<string> {
  const archivePath = await tc.downloadTool(getUrl(version));
  const extractedPath = await tc.extractTar(archivePath);
  const toolPath = path.join(extractedPath, getArchiveName(version));
  const cachePath = await tc.cacheDir(toolPath, "goxz", version);
  core.debug(`goxz is cached under ${cachePath}`);
  return cachePath;
}

function getUrl(version: string): string {
  return `https://github.com/Songmu/goxz/releases/download/${version}/${getArchiveName(version)}.tar.gz`
}

function getArchiveName(version: string): string {
  return `goxz_${version}_linux_amd64`
}

function buildFlags(): Array<string> {
  return Object.entries(inputByGoxzFlag)
    .map(([k, v]) => [k, core.getInput(v)])
    .filter(([_, v]) => v.length > 0)
    .map(([k ,v]) => `-${k}="${v}"`);
}

run();
