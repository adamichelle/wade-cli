const chalk = require('chalk');
const ghGraphQLClient = require('@octokit/graphql');

const fileHelper = require('./utils/fileHelper');
const gitInitFunctions = require('./utils/gitInitFunctions');

/**
 * Function to automate GitHub repository creation workflow
 * @returns 
 */
const gitInit = async function () {
    let remoteRepoUrl, remoteRepoName, remoteRepoBrowserLink;

    if (fileHelper.directoryExists('.git')) {
        console.log(`${chalk.red('ERROR:')} Git already initialized in this directory!`);
        process.exit();
    }

    const token = await gitInitFunctions.getPersonalAccesstoken();
    
    if(!fileHelper.directoryExists('.gitignore')) {
        const addGitIgnoreRes = await gitInitFunctions.addGitIgnore();
        if(!addGitIgnoreRes) return;
    }

    if(!fileHelper.directoryExists('README.md')) {
        const addReadMeRes = await gitInitFunctions.addReadMe();
        if(!addReadMeRes) return;
    }

    try {
        const { url, name } = await gitInitFunctions.setUpRemoteRepo(token);
        remoteRepoUrl = url;
        remoteRepoName = name;
        remoteRepoBrowserLink = url.split(/\.git/g)[0];
    } catch (error) {
        if(error.name && error.name === "HttpError") {
            switch (error.status) {
                case 401:
                    console.log(`${chalk.red('ERROR:')} Couldn\'t log you in. Your token may be incorrect or expired. Please provide correct credentials/token.`);
                    console.log(`${chalk.red('ERROR:')} ${error.message}. Run ${chalk.yellow('wade refresh-token <new-token>')} to create a new one.`);
                    break;
                case 422:
                    console.log(`${chalk.red('ERROR:')} There is already a remote repository or token with the same name.`);
                    break;
                default:
                  console.log(`${chalk.red()} ${err}`);
            }
        }  else if (error instanceof ghGraphQLClient.GraphqlResponseError) {
            console.log(`${chalk.red('ERROR:')} ${error.message}`);
        }
        else {
            console.log(`${chalk.red('ERROR:')} ${error}`)
        }

        return;
    }
    
    try {
        await gitInitFunctions.initializeAndPushRepo(remoteRepoUrl);
        console.log(`${chalk.green('SUCCESS:')} Git has been initialized in your project and successfully pushed.`)
        console.log(`Project name: ${remoteRepoName}, Repository link: ${remoteRepoBrowserLink} `)
    } catch (error) {
        console.log(`${chalk.red('ERROR:')} ${error.message}`);
        console.log(`${chalk.red("ERROR:")} Unable to set up local repo and push to remote due to the error above. \nVisit this link to manually complete the process.${remoteRepoBrowserLink}`);
    }

    const packageJSONUpdateRes = gitInitFunctions.updatePackageJSON(remoteRepoUrl);
    if(packageJSONUpdateRes.containsPackageJson) {
        if(packageJSONUpdateRes.success) {
            console.log(`${chalk.green('SUCCESS:')} The package.json file has successfully been updated with the repository link.`)
        } else {
            console.log(`${chalk.red("ERROR:")} Unable to update package.json file. Message: ${packageJSONUpdateRes.message}. You will have to update the repository field yourself.`);
        }
    }
}
module.exports = gitInit;