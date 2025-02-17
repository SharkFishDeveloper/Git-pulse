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
const fs_extra_1 = __importDefault(require("fs-extra"));
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
    filesDirectoryToStageEverything() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const files = fs_1.default.readdir(process.cwd(), (err, files) => {
                    if (err) {
                        console.error('Error reading directory:', err);
                        reject(err);
                    }
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
                    resolve(filteredFiles);
                });
            });
        });
    }
    checkUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            const filesDirectory = yield this.filesDirectory();
            const normalizedFiles = filesDirectory.map(file => path_1.default.join(process.cwd(), file));
            const regex = /\.[a-zA-Z0-9]+$/;
            let correctedFilesStaging = [];
            const stagingFiles = fs_1.default.readdir(this.stagingPath, { recursive: true }, (err, files) => {
                const correctedFiles = files.filter(file => regex.test(file));
                correctedFilesStaging === null || correctedFilesStaging === void 0 ? void 0 : correctedFilesStaging.push(...correctedFiles.map(file => file.toString().replace(/\\/g, '\\')));
            });
            // console.log("stagingFiles",correctedFilesStaging);
            correctedFilesStaging.forEach((fileS) => {
                if (!filesDirectory.includes(fileS)) {
                    var hasExtension = fileS.includes('.') && !fileS.endsWith('.');
                    if (hasExtension) {
                        hasExtension = 'file';
                    }
                    else {
                        hasExtension = 'directory';
                    }
                    const fileinDirectorypath = path_1.default.join(this.stagingPath, fileS);
                    const filePath = path_1.default.join(this.stagingPath, fileS);
                    const lindex = fileinDirectorypath.lastIndexOf("\\");
                    const filePathCheck = fileinDirectorypath.slice(0, lindex);
                    // console.log("FIle path",filePathCheck);
                    try {
                        fs_1.default.unlinkSync(filePath);
                        if (!fs_1.default.existsSync(filePathCheck)) {
                            console.log("File does not exist", filePathCheck);
                            fs_1.default.rmdirSync(filePathCheck);
                        }
                    }
                    catch (error) {
                    }
                    console.log(`${fileS} does not exist in working directory`);
                }
            });
            const untrackedFiles = [];
            const modifiedFiles = [];
            const stagingFilesMatching = [];
            filesDirectory === null || filesDirectory === void 0 ? void 0 : filesDirectory.map((file => {
                const filePath = path_1.default.join(this.stagingPath, file);
                if (fs_1.default.existsSync(filePath)) {
                    const stagingFilePath = path_1.default.join(process.cwd(), file);
                    const contentFileDir = fs_1.default.readFileSync(filePath, "utf-8");
                    const contentFileStaging = fs_1.default.readFileSync(stagingFilePath, "utf-8");
                    if (contentFileDir !== contentFileStaging) {
                        modifiedFiles.push(file);
                    }
                    // console.log("File path exists",file,contentFileDir,contentFileStaging)
                }
                else {
                    untrackedFiles.push(file);
                    //  console.log(clc.red(`Untracked file -> ${file}`));
                }
            }));
            if (untrackedFiles.length > 0) {
                console.log(cli_color_1.default.whiteBright("Use git add . or git add <file> to add to staging area"));
            }
            untrackedFiles.forEach((file) => {
                console.log(cli_color_1.default.red(`Untracked file -> ${file}`));
            });
            modifiedFiles.forEach((file) => {
                console.log(cli_color_1.default.yellow(`Modified file -> ${file}`));
            });
            if (untrackedFiles.length === 0 && modifiedFiles.length === 0) {
                console.log(cli_color_1.default.greenBright("Everything is up to date"));
            }
            // setInterval(() => this.checkUpdates(), 5000);
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkUpdates();
        });
    }
    add(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file === ".") {
                console.log(cli_color_1.default.green("Added all the files to staging area"));
                const filesDir = yield this.filesDirectoryToStageEverything();
                const pathnew = process.cwd();
                filesDir.forEach((files) => {
                    console.log("PAth new ->", path_1.default.join(pathnew, files));
                    this.readDirectory(path_1.default.join(pathnew, files), files, "staging");
                });
                console.log(cli_color_1.default.greenBright("Everything is staged"));
            }
            else {
                var filePath = path_1.default.join(process.cwd(), file);
                const stats = fs_1.default.existsSync(filePath) ? fs_1.default.statSync(file) : null;
                if (!stats) {
                    return console.log(cli_color_1.default.magentaBright(`${file} does not exist in ${filePath}`));
                }
                if (stats.isFile()) {
                    const lindex = file.lastIndexOf("/");
                    var firstPart = file.slice(0, lindex);
                    firstPart = path_1.default.join(this.stagingPath, firstPart);
                    const fileName = file.slice(lindex);
                    // console.log(firstPart)
                    // console.log(lindex)
                    // console.log(fileName)
                    // console.log(lindex,firstPart,file,"####");
                    const filecontent = fs_1.default.readFileSync(filePath, "utf-8");
                    // console.log(firstPart,filePath)
                    fs_1.default.mkdirSync(firstPart, { recursive: true });
                    fs_1.default.writeFileSync(path_1.default.join(firstPart, fileName), filecontent);
                }
                else if (stats.isDirectory()) {
                    const items = fs_1.default.readdirSync(filePath, { withFileTypes: true });
                    console.log(filePath, file);
                    this.readDirectory(filePath, file, "staging");
                }
                console.log(cli_color_1.default.green(`Added ${file} to staging area`));
            }
        });
    }
    readDirectory(directoryPath, file, pathData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = fs_1.default.readdirSync(directoryPath, { withFileTypes: true });
                for (const item of items) {
                    // console.log("-->",directoryPath,file,item.name,pathData);
                    var fullPath = path_1.default.join(directoryPath, item.name);
                    fullPath = fullPath.replace(/\\/g, '/');
                    const index = fullPath.indexOf(file);
                    if (item.isDirectory()) {
                        console.log("D");
                        yield this.readDirectory(fullPath, file, pathData);
                    }
                    else if (item.isFile()) {
                        console.log("F");
                        const content = fs_1.default.readFileSync(fullPath, "utf-8");
                        const pathindex = fullPath.slice(index);
                        // console.log(`Path:${fullPath.slice(index)}`);
                        // console.log(`File: ${fullPath}`);
                        // console.log(`Content: ${content}`);
                        var firstPath = "";
                        if (!fs_1.default.existsSync(path_1.default.join(this.stagingPath, pathindex))) {
                            console.log("Does not Ex");
                            const lindex = pathindex.lastIndexOf("/");
                            const firstPart = pathindex.slice(0, lindex);
                            const filename = pathindex.slice(lindex);
                            console.log("First part", firstPart);
                            firstPath = pathData === "staging" ? path_1.default.join(this.stagingPath, firstPart) : pathData;
                            console.log("FIRST PATH", firstPath);
                            // console.log("Does not exts in OBJ",firstPart,lindex,filename);
                            // try {
                            //   fs.mkdirSync(firstPath, { recursive: true });
                            // } catch (error) {
                            //   console.log("ERROR ####",error)
                            // }
                            // console.log("Content",content);
                            try {
                                fs_1.default.writeFileSync(path_1.default.join(firstPath, filename), content);
                            }
                            catch (error) {
                                console.log("Already added to stage area");
                            }
                        }
                        else {
                            console.log("Exists");
                            console.log("FIRST PATH", firstPath);
                            const lindex = pathindex.lastIndexOf("/");
                            const firstPart = pathindex.slice(0, lindex);
                            const filename = pathindex.slice(lindex);
                            const firstPathQ = pathData === "staging" ? path_1.default.join(this.stagingPath, firstPart) : pathData;
                            console.log("staging data", firstPathQ);
                            try {
                                fs_1.default.writeFileSync(path_1.default.join(firstPathQ, filename), content);
                            }
                            catch (error) {
                                console.log("->>>>>>", error);
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error reading directory: ${error}`);
            }
        });
    }
    commit(message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Commit Message : ", message);
            const commitDataPath = fs_1.default.readFileSync(this.commitsPath, "utf-8");
            const pathStage = [];
            const stagedFiles = [];
            const regex = /\.[a-zA-Z0-9]+$/;
            if (commitDataPath === "init") {
                try {
                    const files = yield new Promise((resolve, reject) => {
                        fs_1.default.readdir(this.stagingPath, (err, files) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(files);
                            }
                        });
                    });
                    stagedFiles.push(...files);
                }
                catch (err) {
                    console.error("Error reading staging directory:", err);
                }
            }
            stagedFiles.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                pathStage.push(path_1.default.join(this.stagingPath, file));
                const path1 = (path_1.default.join(this.stagingPath, file));
                yield this.copyDirectory(path1, path_1.default.join(this.objPath, "init"))
                    .then(() => console.log('Copy operation completed successfully'))
                    .catch(err => console.error('Error during copy operation:', err));
            }));
            console.log(pathStage);
        });
    }
    copyDirectory(sourceDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_extra_1.default.copy(sourceDir, destDir, {
                    overwrite: true, // Overwrites the content if it already exists
                    errorOnExist: false // Don't throw an error if the destination exists
                });
                console.log(`Copied from ${sourceDir} to ${destDir}`);
            }
            catch (error) {
                console.error(`Error copying directory: ${error}`);
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
program
    .command('commit <message>')
    .description('Commits the project')
    .action((message) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse === null || gitpulse === void 0 ? void 0 : gitpulse.commit(message);
});
program.command('add <action>')
    .description("Add files to stage area")
    .action((action) => {
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse === null || gitpulse === void 0 ? void 0 : gitpulse.add(action);
});
program.parse(process.argv);
