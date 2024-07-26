import { Command } from "commander";
import path from "path";
import fs from "fs";
import crypto from "crypto"

var configPath = path.resolve(__dirname, 'gitpulse-config.json');

class Gitpulse{
    rootpath = '';
    gitpath = '';
    fileName="";
    objPath="";
    stagingPath="";
    commitsPath="";
    configPath="";
    constructor(fileName:string){
        if(fileName===""){
             console.log("Return");
             return;
        }
        this.fileName = fileName;
        if(fileName!=="status" &&  !fs.existsSync(path.join(this.rootpath,path.join(`${this.fileName}`)))){
            console.log("No such directory with this name",fileName);
            return;
        }
        this.rootpath = process.cwd();
        this.gitpath = path.join(this.rootpath,path.join(`${this.fileName}`,"/.gitpulse"));
        this.objPath = path.join(this.gitpath+path.join("/obj"));
        this.stagingPath = path.join(this.gitpath+path.join("/staging"));
        this.commitsPath = path.join(this.gitpath+path.join("/commits.txt"));
        // configPath=path.resolve(this.gitpath,'gitpulse-config.json');
        if(fileName!=="status"){

          this.init();
        }
    }
    async init(){
        const pathFile = path.join(process.cwd(),`/${this.fileName}`);
        const gitExists = fs.existsSync(this.gitpath);
        console.log(this.gitpath);
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
            console.log("Git exists");
        }
    }
    
    status(){
        const data = fs.readFileSync(`${this.commitsPath}`,"utf-8");
        console.log(data);
    }
    static loadFromConfig(): Gitpulse | null {
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          console.log("true");
          return new Gitpulse(config.fileName);
        }
        return null;
      }
    
      saveToConfig() {
        const config = {
          fileName: this.fileName,
        };
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
      }

}

export default Gitpulse;

function createHash({data=""}:{data:string}) {
    const hash = crypto.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
  }

const program = new Command();

let gitpulse: Gitpulse | null;


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
  .action((options,command) => {
    gitpulse = Gitpulse.loadFromConfig();
    if (gitpulse) {
        gitpulse.status();
    } else {
        console.error('Gitpulse not initialized. Please run "init" with the name of the project first.');
    }
  });

// program.parse(process.argv);




  const args = process.argv.slice(2);
if(args[0]==="init"){
  if(!args[1]){
    console.log("No project name found , Please run npm run dev init --name <name>");
  }
  else{
    gitpulse= new Gitpulse(args[1]);
    gitpulse.saveToConfig();
  }
}else{
   try {
    program.parse(args);
    console.log("Over here");
   } catch (error) {
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