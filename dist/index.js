"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const cli_color_1 = __importDefault(require("cli-color"));
var configPath = path_1.default.join(process.cwd(), "/.gitpulse/config.json");
class Gitpulse {
    constructor() {
        this.rootpath = '';
        this.gitpath = '';
        this.objPath = "";
        this.stagingPath = "";
        this.commitsPath = "";
        this.configPath = "";
        this.rootpath = process.cwd();
        this.gitpath = path_1.default.join(this.rootpath, ".gitpulse");
        this.objPath = path_1.default.join(this.gitpath, "obj");
        this.stagingPath = path_1.default.join(this.gitpath, "staging");
        this.commitsPath = path_1.default.join(this.gitpath, "commits.txt");
        if (!fs_1.default.existsSync(path_1.default.join(this.gitpath))) {
            console.log("No git directory exists");
        }
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitExists = fs_1.default.existsSync(this.gitpath);
            if (!gitExists) {
                try {
                    fs_1.default.mkdir(this.gitpath, { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.writeFileSync(this.commitsPath, "init");
                    fs_1.default.mkdir(this.stagingPath, { recursive: true }, (err) => {
                        console.log(err);
                    });
                    fs_1.default.mkdir(`${this.objPath}/init`, { recursive: true }, (err) => {
                        console.log(err);
                    });
                }
                catch (error) {
                    console.log(error);
                }
            }
            else {
                // console.log(".gitpulse aleady exists");
            }
        });
    }
    static loadFromConfig() {
        if (fs_1.default.existsSync(configPath)) {
            return new Gitpulse();
        }
        return null;
    }
    saveToConfig() {
        const config = {
            fileName: process.cwd(),
        };
        fs_1.default.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
    }
    filesDirectory() {
        return new Promise((resolve, reject) => {
            const commit = fs_1.default.readFileSync(`${this.commitsPath}`, "utf-8");
            console.log(commit);
            const files = fs_1.default.readdir(process.cwd(), { recursive: true }, (err, files) => {
                if (err) {
                    console.error('Error reading directory:', err);
                    reject(err);
                }
                const regex = /\.[a-zA-Z0-9]+$/;
                const filteredFiles = files.filter(file => {
                    const fileName = file;
                    return !fileName.startsWith('.git') &&
                        !fileName.startsWith('.gitpulse') &&
                        !fileName.startsWith('node_modules') &&
                        !fileName.startsWith('package') &&
                        !fileName.startsWith('tsconfig') &&
                        !fileName.startsWith('src') &&
                        !fileName.startsWith('dist');
                });
                const correctedFiles = filteredFiles.filter(file => regex.test(file));
                resolve(correctedFiles);
            });
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            const commitId = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            const files = yield this.filesDirectory();
            const normalizedFiles = files.map(file => path_1.default.join(process.cwd(), file));
            files.forEach((file) => {
                if (!fs_1.default.existsSync(path_1.default.join(this.objPath, file))) {
                    console.log(cli_color_1.default.red("New -> ", `${file}`));
                }
            });
        });
    }
    add(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file === ".") {
                console.log(cli_color_1.default.green("Added all the files to staging area"));
            }
            else {
                const filePath = path_1.default.join(process.cwd(), file);
                if (!fs_1.default.existsSync(filePath)) {
                    return console.log(cli_color_1.default.magenta(`${file} does not exist in ${filePath}`));
                }
                else {
                }
                console.log(cli_color_1.default.green(`Added ${file} to staging area`));
            }
        });
    }
}
exports.default = Gitpulse;
function createHash({ data = "" }) {
    const hash = crypto_1.default.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
}
const program = new commander_1.Command();
let gitpulse;
const args = process.argv.slice(2);
program
    .command('status')
    .description('Check the status of the project')
    .action((options, command) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.status();
    }
    else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
});
program
    .command('init')
    .description('Initialize Gitpulse in project')
    .action((options, command) => {
    gitpulse = new Gitpulse();
    gitpulse.saveToConfig();
});
program.command('add <action>')
    .description("Add files to stage area")
    .action((action) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse === null || gitpulse === void 0 ? void 0 : gitpulse.add(action);
});
program.parse(process.argv);
