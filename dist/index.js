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
var configPath = path_1.default.resolve(__dirname, 'gitpulse-config.json');
class Gitpulse {
    constructor(fileName) {
        this.rootpath = '';
        this.gitpath = '';
        this.fileName = "";
        this.objPath = "";
        this.stagingPath = "";
        this.commitsPath = "";
        this.configPath = "";
        if (fileName === "") {
            console.log("Return");
            return;
        }
        this.fileName = fileName;
        if (fileName !== "status" && !fs_1.default.existsSync(path_1.default.join(this.rootpath, path_1.default.join(`${this.fileName}`)))) {
            console.log("No such directory with this name", fileName);
            return;
        }
        this.rootpath = process.cwd();
        this.gitpath = path_1.default.join(this.rootpath, path_1.default.join(`${this.fileName}`, "/.gitpulse"));
        this.objPath = path_1.default.join(this.gitpath + path_1.default.join("/obj"));
        this.stagingPath = path_1.default.join(this.gitpath + path_1.default.join("/staging"));
        this.commitsPath = path_1.default.join(this.gitpath + path_1.default.join("/commits.txt"));
        // configPath=path.resolve(this.gitpath,'gitpulse-config.json');
        if (fileName !== "status") {
            this.init();
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const pathFile = path_1.default.join(process.cwd(), `/${this.fileName}`);
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
            return new Gitpulse(config.fileName);
        }
        return null;
    }
    saveToConfig() {
        const config = {
            fileName: this.fileName,
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
// program
//   .command('init <name>')
//   .action((name: string) => {
//     gitpulse = new Gitpulse(name);
//     gitpulse.saveToConfig();
//     // console.log("HERE",configPath);
//   });
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
// program.parse(process.argv);
const args = process.argv.slice(2);
if (args[0] === "init") {
    if (!args[1]) {
        console.log("No project name found , Please run npm run dev init --name <name>");
    }
    else {
        gitpulse = new Gitpulse(args[1]);
        gitpulse.saveToConfig();
    }
}
else {
    try {
        program.parse(args);
        console.log("Over here");
    }
    catch (error) {
        console.log(error);
    }
}
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
