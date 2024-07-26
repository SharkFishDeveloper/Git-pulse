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

   async status(){
      const commitId = fs.readFileSync(this.commitsPath,"utf-8");
      const files = await this.filesDirectory();
      const normalizedFiles = files.map(file => path.join(process.cwd(),file));
      files.forEach((file)=>{
        if(!fs.existsSync(path.join(this.objPath,file))){
          console.log(clc.red("New -> ",`${file}`));
        }
      })
    }

    async add(file:string) {
      if(file === "."){
        console.log(clc.green("Added all the files to staging area"));
      }else{
        const filePath = path.join(process.cwd(),file);
        if(!fs.existsSync(filePath)){
          return console.log(clc.magenta(`${file} does not exist in ${filePath}`));
        }else{

        }
        console.log(clc.green(`Added ${file} to staging area`));
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


  
  program.command('add <action>')
  .description("Add files to stage area")
  .action((action:string)=>{
    gitpulse = Gitpulse.loadFromConfig();
    gitpulse?.add(action);
  })


  program.parse(process.argv);
  