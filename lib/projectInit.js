const chalk = require('chalk');
const fileHelper = require('./utils/fileHelper');
const prompts = require('./utils/prompts');
const projectInitFunctions = require('./utils/projectInitFunctions');
const gitInit = require('./gitInit');

const projectInit = async function (projectName, options) {
    const projectTypeAnswer = await prompts.askProjectType();
    const projectType = projectTypeAnswer.projectType;
    let projectDetails = {};

    if(fileHelper.directoryExists(projectName)) {
        console.log(`${chalk.red("ERROR:")} There is already a folder with the same name!`);
        return;
    } 

    if(projectType === 'Node') {
        projectDetails = await prompts.askNodeProjectDetails();
    }

    console.log(`\nCreating a new ${projectType} project in ${chalk.yellow(`~/${projectName}`)}...\n`);

    const projectFolderCreationRes = projectInitFunctions.createProjectFolder(projectName);

    if(!projectFolderCreationRes) {
        return;
    }

    const res = await projectInitFunctions.addGitIgnore(projectType);

    if(res) {
        console.log(`${chalk.blue("INFO:")} .gitignore file successfully added.`);
    } else {
        console.log(`${chalk.red("ERROR:")} Unable to add gitignore file. An error occured \nMessage: ${res.message} \nYou might need to add it yourself.`);
    }
      
    if(options.license) {
        await projectInitFunctions.addLicense(options.license, projectDetails.author)
        projectDetails.license = options.license.toUpperCase();
    } else {
        projectDetails.license = 'MIT';
    }
    
    projectInitFunctions.addReadMe(projectName);

    projectInitFunctions.create(projectType, projectName, projectDetails);

    console.log(`\nSuccess! Created a ${projectType} project in ~/${projectName}.`);
    console.log(`\nNavigate to your newly created ${projectType} project by typing:\n ${chalk.blueBright("cd")} ${projectName}`);
}

module.exports = projectInit;
