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
var configPath = path_1.default.join(process.cwd(), "/.gitpulse/config.json");
class Gitpulse {
    constructor() {
        this.rootpath = '';
        this.gitpath = '';
        this.fileName = "";
        this.objPath = "";
        this.stagingPath = "";
        this.commitsPath = "";
        this.configPath = "";
        this.rootpath = process.cwd();
        this.gitpath = path_1.default.join(this.rootpath, ".gitpulse");
        this.objPath = path_1.default.join(this.gitpath, "obj");
        this.stagingPath = path_1.default.join(this.gitpath, "staging");
        this.commitsPath = path_1.default.join(this.gitpath, "commits.txt");
        console.log("START");
        if (!fs_1.default.existsSync(path_1.default.join(this.gitpath))) {
            console.log("No git directory exists");
        }
        console.log("CONFIG", configPath);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitExists = fs_1.default.existsSync(this.gitpath);
            console.log(this.gitpath);
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
                console.log("Git exists");
            }
        });
    }
    status() {
        const data = fs_1.default.readFileSync(`${this.commitsPath}`, "utf-8");
        console.log(data);
    }
    static loadFromConfig() {
        if (fs_1.default.existsSync(configPath)) {
            const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
            console.log("true");
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
    console.log("INIT COMMAND");
    gitpulse = new Gitpulse();
    gitpulse.saveToConfig();
    console.log("Git found");
});
program.parse(process.argv);
// console.log("Commands parsed:", process.argv);
// const data = fs.readdir(pathFile,{recursive:true},(err,files)=>{
//       if (err) {
//         console.error('Error reading directory:', err);
//         return;
//       }
//       const regex = /\.[a-zA-Z0-9]+$/;
//       const filteredFiles = files.filter(file => regex.test(file as string));
//       console.log('Files in directory:', filteredFiles); 
// });
// fs.mkdir(this.gitpath+path.join("/obj"),{recursive:true},(err)=>{
//     const initialHash = createHash({data:""});
//     fs.mkdir(this.gitpath+path.join(`/obj/${initialHash}`),{recursive:true},(err)=>{
//         console.log(err);
//     });
// });
