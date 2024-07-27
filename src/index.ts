import { Command } from "commander";
import path from "path";
import fs from "fs";
import crypto from "crypto"
import  dirCompare from "dir-compare"
import clc from "cli-color"

var configPath = path.join(process.cwd(),"/.gitpulse/config.json");

class Gitpulse{
    rootpath = '';
    gitpath = '';
    objPath="";
    stagingPath="";
    commitsPath="";
    configPath="";

    constructor(){
        this.rootpath = process.cwd();
        this.gitpath = path.join(this.rootpath, ".gitpulse");
        this.objPath = path.join(this.gitpath, "obj");
        this.stagingPath = path.join(this.gitpath, "staging");
        this.commitsPath = path.join(this.gitpath, "commits.txt");
        if(!fs.existsSync(path.join(this.gitpath))){
          console.log("No git directory exists");
        }
        this.init();
    }
    async init(){
        const gitExists = fs.existsSync(this.gitpath);
        if(!gitExists){
            try {
                fs.mkdir(this.gitpath,{recursive:true},(err)=>{
                    console.log(err);
                });
                fs.writeFileSync(this.commitsPath,"init");
                fs.mkdir(this.stagingPath,{recursive:true},(err)=>{
                    console.log(err);
                });
                fs.mkdir(`${this.objPath}/init`,{recursive:true},(err)=>{
                        console.log(err);
                });
                
            } catch (error) {
                console.log(error);
            }
        }else{
            // console.log(".gitpulse aleady exists");
        }
    }

    static loadFromConfig(): Gitpulse | null {
      if (fs.existsSync(configPath)) {
          return new Gitpulse();
      }
      return null;
    }
      
    saveToConfig() {
      const config = {
        fileName: process.cwd(),
      };
      fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
    }
    
      filesDirectory():Promise<string[]>{
        return new Promise((resolve, reject) => {
            const commit = fs.readFileSync(`${this.commitsPath}`,"utf-8");
            console.log(commit);
            const files = fs.readdir(process.cwd(),{recursive:true},(err,files)=>{
              if (err) {
                console.error('Error reading directory:', err);
                reject(err);
              }
              const regex = /\.[a-zA-Z0-9]+$/;
              const filteredFiles = files.filter(file=>{
                const fileName = file as string;
                return !fileName.startsWith('.git') &&
                !fileName.startsWith('.gitpulse') &&
                !fileName.startsWith('node_modules') &&
                !fileName.startsWith('package') &&
                !fileName.startsWith('tsconfig') &&
                !fileName.startsWith('src') &&
                !fileName.startsWith('dist');
              })
              const correctedFiles = filteredFiles.filter(file => regex.test(file as string));
              resolve(correctedFiles as string[]);
        });
      });
    }

     async filesDirectoryToStageEverything(): Promise<string[]> {
      return new Promise((resolve, reject) => {
        const files = fs.readdir(process.cwd(),(err,files)=>{
          if (err) {
            console.error('Error reading directory:', err);
            reject(err);
          }
          const filteredFiles = files.filter(file=>{
            const fileName = file as string;
            return !fileName.startsWith('.git') &&
            !fileName.startsWith('.gitpulse') &&
            !fileName.startsWith('node_modules') &&
            !fileName.startsWith('package') &&
            !fileName.startsWith('tsconfig') &&
            !fileName.startsWith('src') &&
            !fileName.startsWith('dist');
          })
          resolve(filteredFiles);
    });
    });
    }

    async checkUpdates(){
      const filesDirectory = await this.filesDirectory();
      const normalizedFiles = filesDirectory.map(file => path.join(process.cwd(),file));
      const regex = /\.[a-zA-Z0-9]+$/;
      let correctedFilesStaging:string[]|null=[];
      const stagingFiles = fs.readdir(this.stagingPath,{recursive:true},(err,files)=>{
        const correctedFiles = files.filter(file => regex.test(file as string));
        correctedFilesStaging?.push(...correctedFiles.map(file => file.toString().replace(/\\/g, '\\')));
      });
      // console.log("stagingFiles",correctedFilesStaging);
      
      correctedFilesStaging.forEach((fileS)=>{
        if(!filesDirectory.includes(fileS)){
          var hasExtension:boolean|string = fileS.includes('.') && !fileS.endsWith('.');
            if (hasExtension) {
              hasExtension = 'file'
            } else {
               hasExtension = 'directory'
            }
            const fileinDirectorypath = path.join(this.stagingPath,fileS);
            const filePath = path.join(this.stagingPath,fileS);
            const lindex = fileinDirectorypath.lastIndexOf("\\");
            const filePathCheck = fileinDirectorypath.slice(0,lindex)
            // console.log("FIle path",filePathCheck);
          try {
            fs.unlinkSync(filePath);
            if(!fs.existsSync(filePathCheck)){
              console.log("File does not exist",filePathCheck)
              fs.rmdirSync(filePathCheck);
            }
          } catch (error) {
            
          }
          console.log(`${fileS } does not exist in working directory`);
        }
      })
      const untrackedFiles:string[]|null = [];
      const modifiedFiles:string[]|null = [];
      const stagingFilesMatching:string[]|null = [];
      filesDirectory?.map((file=>{
        const filePath = path.join(this.stagingPath,file);
        if(fs.existsSync(filePath)){
          const stagingFilePath = path.join(process.cwd(),file);
          const contentFileDir = fs.readFileSync(filePath,"utf-8");
          const contentFileStaging = fs.readFileSync(stagingFilePath,"utf-8");
          if(contentFileDir!==contentFileStaging){
            modifiedFiles.push(file);
          }
          // console.log("File path exists",file,contentFileDir,contentFileStaging)
        }
        else{
          untrackedFiles.push(file);
        //  console.log(clc.red(`Untracked file -> ${file}`));
        }
      }))
      if(untrackedFiles.length>0){
        console.log(clc.whiteBright("Use git add . or git add <file> to add to staging area"));
      }
      untrackedFiles.forEach((file) => {
        console.log(clc.red(`Untracked file -> ${file}`));
      });
      modifiedFiles.forEach((file) => {
        console.log(clc.yellow(`Modified file -> ${file}`));
      });
      if(untrackedFiles.length === 0 && modifiedFiles.length===0){
        console.log(clc.greenBright("Everything is up to date"));
      }
      // setInterval(() => this.checkUpdates(), 5000);
    }


    async status(){
     await this.checkUpdates();
    }

    async add(file:string) {
      if(file === "."){
        console.log(clc.green("Added all the files to staging area"));
        const filesDir =await this.filesDirectoryToStageEverything();
        const pathnew = process.cwd();
        filesDir.forEach((files)=>{
          console.log("PAth new ->",path.join(pathnew,files))
          this.readDirectory(path.join(pathnew,files),files,"staging");
        })
        console.log(clc.greenBright("Everything is staged"))
      }else{
        var filePath = path.join(process.cwd(),file);
        const stats = fs.existsSync(filePath)? fs.statSync(file):null;
        if(!stats){
          return console.log(clc.magentaBright(`${file} does not exist in ${filePath}`));
        }
        if(stats.isFile()){
          const lindex = file.lastIndexOf("/");
          var firstPart = file.slice(0, lindex);
          firstPart = path.join(this.stagingPath,firstPart);
          const fileName = file.slice(lindex);
          // console.log(firstPart)
          // console.log(lindex)
          // console.log(fileName)
          // console.log(lindex,firstPart,file,"####");
          const filecontent = fs.readFileSync(filePath,"utf-8")
          // console.log(firstPart,filePath)
          fs.mkdirSync(firstPart, { recursive: true });
          fs.writeFileSync(path.join(firstPart,fileName),filecontent);

        }else if (stats.isDirectory()){
          const items =  fs.readdirSync(filePath, { withFileTypes: true });
          console.log(filePath,file)
          this.readDirectory(filePath,file,"staging");
        }
        console.log(clc.green(`Added ${file} to staging area`));
      }
    }

    async readDirectory(directoryPath:string,file:string,pathData:string) {
      try {
        
        const items =  fs.readdirSync(directoryPath, { withFileTypes: true });
    
        for (const item of items) {
          console.log("-->",directoryPath,file,item.name,pathData);
          var fullPath = path.join(directoryPath, item.name);
          fullPath = fullPath.replace(/\\/g, '/');
          const index = fullPath.indexOf(file);
         
          if (item.isDirectory()) {
            await this.readDirectory(fullPath,file,pathData);
            console.log("Path data",pathData)
          } else if (item.isFile()) {
            const content =  fs.readFileSync(fullPath,"utf-8");
            const pathindex  = fullPath.slice(index);
            // console.log(`Path:${fullPath.slice(index)}`);
            // console.log(`File: ${fullPath}`);
            // console.log(`Content: ${content}`);
            if(!fs.existsSync(path.join(this.stagingPath,pathindex))){
                const lindex = pathindex.lastIndexOf("/");
                const firstPart = pathindex.slice(0, lindex);
                const filename = pathindex.slice(lindex);
                const firstPath = pathData==="staging"?path.join(this.stagingPath,firstPart):path.join(pathData,firstPart);
                // console.log("Does not exts in OBJ",firstPart,lindex,filename);
                try {
                  fs.mkdirSync(firstPath, { recursive: true });
                } catch (error) {
                  console.log("ERROR ####",error)
                }
                // console.log("Content",content);
                try {
                  fs.writeFileSync(path.join(firstPath,filename),content);
                } catch (error) {
                  console.log("Already added to stage area");
                }
            }else{
              const lindex = pathindex.lastIndexOf("/");
              const firstPart = pathindex.slice(0, lindex);
              const filename = pathindex.slice(lindex);
              const firstPath = path.join(this.stagingPath,firstPart);
              fs.writeFileSync(path.join(firstPath,filename),content);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading directory: ${error}`);
      }
    }


    async commit(message:string){
      console.log("Commit Message : ",message);
      const commitDataPath:string  = fs.readFileSync(this.commitsPath,"utf-8") ;
      if(commitDataPath==="init"){
        console.log("AAA");
        const filesDir =await this.filesDirectoryToStageEverything();
        // console.log(this.objPath,commitDataPath,filesDir);
        const pathnew = path.join(this.objPath,commitDataPath);
        filesDir.forEach((files)=>{
          console.log("?????????",path.join(process.cwd(),files));
          this.readDirectory(path.join(process.cwd(),files),files,pathnew);
        })
      }
    }


}

export default Gitpulse;

function createHash({data=""}:{data:string}) {
    const hash = crypto.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
}

const program = new Command();

let gitpulse: Gitpulse | null ;
const args = process.argv.slice(2);


program
  .command('status')
  .description('Check the status of the project')
  .action((options,command) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.status();
    } else {
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
  .action((message:string) => {
      gitpulse = Gitpulse.loadFromConfig();
      gitpulse?.commit(message);
  });
  
  program.command('add <action>')
  .description("Add files to stage area")
  .action((action:string)=>{
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.add(action);
  })


  program.parse(process.argv);
  