import * as path from 'path';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import {wait} from './wait'

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
  return path.join(tc.find('goxz', version) || await downloadGoxz(version), "goxz");
}

async function downloadGoxz(version: string): Promise<string> {
  const archivePath = await tc.downloadTool(getUrl(version));
  const extractedPath = await tc.extractTar(archivePath);
  return tc.cacheDir(extractedPath, "goxz", version);
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
    .map(([k ,v]) => `--${k}="${v}"`);
}

run();
