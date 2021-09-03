const chalk = require('chalk');
const gitignore = require('gitignore');
const license = require('license');
const util = require('util');

const fileHelper = require('./fileHelper');
const { readMeText } = require('./helpText');
const prompts = require('./prompts');
const giWriteFile = util.promisify(gitignore.writeFile);
const giGetTypes = util.promisify(gitignore.getTypes);


/**
 * Create a package.json file for a node project
 * @param {String} projectName The name of the project
 * @param {Object} projectDetails Project details
 * @returns Boolean showing success or failure
 */
exports.nodeCreate = (projectName, projectDetails) => {
    const keywords = projectDetails.keywords !== '' ? projectDetails.keywords.split(/,\s+/g) : [];

    const packageFileDetails = {
        "name": projectName,
        "version": projectDetails.version,
        "description": projectDetails.description,
        "main": projectDetails.main,
        "scripts": {
          "test": projectDetails.testCommand !== '' ? projectDetails.testCommand : "echo \"Error: no test specified\" && exit 1"
        },
        "keywords": keywords,
        "author": projectDetails.author,
        "license": projectDetails.license,
    }

    let packageFileJSONContent ;
    
    try {
        packageFileJSONContent = JSON.stringify(packageFileDetails, undefined, 2);
    } catch (error) {
        console.log(`${chalk.red("ERROR:")} An error occured while creating the package.json file. \nMessage: JSON object formatting error - ${error.message}`);
        return false;
    }

    const writeContentToFileRes = fileHelper.writeContentToFile('package.json', packageFileJSONContent);

    if(writeContentToFileRes.success) {
        console.log(`${chalk.blue("INFO:")} package.json file successfully added.`);
        return true;
    } else {
        console.log(`${chalk.red("ERROR:")} An error occured while creating the package.json file. \nMessage: ${writeContentToFileRes.message}`);
        return false;
    }

}


/**
 * Create project folder using the given project name
 * @param {String} projectName The name of the project
 * @returns Boolean value to show success or failure
 */
exports.createProjectFolder = (projectName) => {
    const result = fileHelper.makeDirectory(projectName);
    if(result.success) {
        process.chdir(projectName);
        return true;
    }
    else {
        console.log(`${chalk.red("ERROR:")} Unable to create project. \nMessage: ${result.message}.`);
        return false;
    }
}


/**
 * Add gitignore for a project based on the type
 * @param {String} projectType The type of project Node or Python
 * @returns Boolean value to show success or failure
 */
exports.addGitIgnore = async (projectType) => {
    const writableStream = fileHelper.getWritable('.gitignore');
    const options = {
        type: projectType,
        writable: writableStream
    };
    
    try {
        await giWriteFile(options);
        return true;
    } catch (err) {
        return false;
    }
}

exports.getGitIgnoreTypes = async () => {
    try {
        const types = await giGetTypes();
        return { success: true, data: types, message: "Successfully retrived types of gitignore files" };
    } catch (err) {
        return { success: true, data: null, message: err.message };
    }
}


/**
 * Add a license given the license name and the author name.
 * @param {String} name The license name e.g. mit
 * @param {String} author The name of the author
 * @returns 
 */
exports.addLicense = async (name, author) => {
    const licenseList = license.findLicense(name, false);
    let licenseName = 'MIT';

    if(typeof licenseList === 'undefined') {
        console.log(`${chalk.yellow("WARNING:")} Message: An error occured. Using the default license: ${licenseName}`);
    } else if (licenseList.length === 0) {
        console.log(`${chalk.yellow("WARNING:")} ${name.toUpperCase()} license not found. Using the default license: ${licenseName}`);
    } else if(licenseList.length === 1) {
        licenseName = licenseList[0];
    } else {
        const licensePromptAnswer = await prompts.askUserToPickLicense(licenseList);
        licenseName = licensePromptAnswer.license;
    }

    const year = new Date().getFullYear();

    const licenseText = license.getLicense(licenseName, { author: author, year: year });

    const writeContentToFileRes = fileHelper.writeContentToFile('LICENSE', licenseText);

    if(writeContentToFileRes.success) {
        console.log(`${chalk.blue("INFO:")} LICENSE file successfully added.`);
        return true;
    } else {
        console.log(`${chalk.red("ERROR:")} An error occured while creating the LICENSE. Message: ${writeContentToFileRes.message}`);
        return false;
    }
}


/**
 * Add README file function
 * @param {String} projectName Name of the project
 * @returns Boolean indicating success or failure
 */
exports.addReadMe = (projectName) => {
    const readMeContent = `# ${projectName}\n${readMeText}`;
    
    const writeContentToFileRes = fileHelper.writeContentToFile('README.md', readMeContent);

    if(writeContentToFileRes.success) {
        console.log(`${chalk.blue("INFO:")} README file successfully added.`);
        return true;
    } else {
        console.log(`${chalk.red("ERROR:")} An error occured while creating the README. Message: ${writeContentToFileRes.message}`);
        return false;
    }
}


/**
 * Create a project
 * @param {String} projectType The type of project Node or Python
 * @param {String} projectName The name of the project
 * @param {Object} projectDetails Details of the project.
 * @returns Boolean showing success or failure
 */
exports.create = (projectType, projectName, projectDetails) => {
    let result;
    if(projectType === 'Node') {
        result = exports.nodeCreate(projectName, projectDetails);
    }

    return result;
}
