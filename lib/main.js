"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const tc = __importStar(require("@actions/tool-cache"));
const inputByGoxzFlag = {
    arch: 'arch',
    os: 'os',
    'build-ldflags': 'ldflags',
    'build-tags': 'tags',
    d: 'dest',
    n: 'name',
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const goxzVersion = core.getInput('goxz-version');
            const goxzPath = yield getGoxzPath(goxzVersion);
            yield exec.exec(goxzPath, [
                ...buildFlags(),
                core.getInput("package"),
            ]);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function getGoxzPath(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolPath = tc.find('goxz', version) || (yield downloadGoxz(version));
        core.debug(`contained entries: ${fs.readdirSync(toolPath)}`);
        return path.join(toolPath, getArchiveName(version), "goxz");
    });
}
function downloadGoxz(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const archivePath = yield tc.downloadTool(getUrl(version));
        const extractedPath = yield tc.extractTar(archivePath);
        const toolPath = path.join(extractedPath, getArchiveName(version));
        const cachePath = yield tc.cacheDir(toolPath, "goxz", version);
        core.debug(`goxz is cached under ${cachePath}`);
        return cachePath;
    });
}
function getUrl(version) {
    return `https://github.com/Songmu/goxz/releases/download/${version}/${getArchiveName(version)}.tar.gz`;
}
function getArchiveName(version) {
    return `goxz_${version}_linux_amd64`;
}
function buildFlags() {
    return Object.entries(inputByGoxzFlag)
        .map(([k, v]) => [k, core.getInput(v)])
        .filter(([_, v]) => v.length > 0)
        .map(([k, v]) => `-${k}="${v}"`);
}
run();
