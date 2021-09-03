const CLI = require('clui');
const Conf = require('conf');
const simpleGit = require('simple-git');
const simpleOctokit = require('simple-octokit');

const Spinner = CLI.Spinner;
const config = new Conf();
const git = simpleGit();;

const fileHelper = require('./fileHelper');
const projectInitFunctions = require('./projectInitFunctions');
const prompts = require('./prompts');
const repoPushStatus = new Spinner('Initializing a local repository and pushing to remote...');

/**
 * Get a personal access token either from local config or terminal
 * @returns String personal access token
 */
exports.getPersonalAccesstoken = async () => {
    let token = config.get('github-token')

    if(!token) {
        const gitCredPromptAnswer = await prompts.askGithubCredentials();

        token = gitCredPromptAnswer.personalAccessToken;

        config.set('github-token', token);
    }

    return token;
}

/**
 * Generate details needed to create a remote repo
 * @returns The details of the repository to be created
 */
const generateRemoteRepoDetails = async () => {
    let name, description, visibility;

    if(fileHelper.directoryExists('package.json')) {
        const result = fileHelper.readPackageJSONFile();
        if(result.success) {
            name = result.data.name;
            description = result.data.description;
            const repoVisibilityPrompt = await prompts.askForRepoVisibility();
            visibility = repoVisibilityPrompt.repoVisibility;
        } else {
            console.log(`${chalk.red("ERROR:")} Unable to read package.json file. Message: ${result.message}.`);
            const repoInfoPrompt = await prompts.askForRepoInfo();
            name = repoInfoPrompt.repoName;
            description = repoInfoPrompt.repoDescription;
            visibility = repoInfoPrompt.repoVisibility;
        }
    }
    else {
        const repoInfoPrompt = await prompts.askForRepoInfo();
        name = repoInfoPrompt.repoName;
        description = repoInfoPrompt.repoDescription;
        visibility = repoInfoPrompt.repoVisibility;
    }

    return { name, visibility, description };
}

/**
 * Set up a remote repository
 * @param {String} token The personal access token
 * @returns 
 */
exports.setUpRemoteRepo = async (token) => {
    const octokit = simpleOctokit(token);
    const { name, visibility, description } = await generateRemoteRepoDetails();
    const status = new Spinner('Creating remote repository...');
    status.start();

    const mutation = `
        mutation CreateRepository($name: String!, $visibility: RepositoryVisibility!, $description: String = "") {
            createRepository(input: { name: $name, visibility: $visibility, description: $description }) {
                repository {
                    url,
                    name
                }
            }
        }
    `;

    try {
        const { createRepository } = await octokit.graphql(mutation, {
            name: name,
            visibility: visibility.toUpperCase(),
            description: description
        });
        
        return createRepository.repository;
    } finally {
        status.stop();
    }
}

/**
 * Add a gitignore file on setting up local repo
 * @returns Object with success or failure information
 */
exports.addGitIgnore = async () => {
    const getTypesRes = await projectInitFunctions.getGitIgnoreTypes();
    if(getTypesRes.success) {
        const promptsRes = await prompts.askForGitIgnoreType(getTypesRes.data);
        return await projectInitFunctions.addGitIgnore(promptsRes.gitIgnoreType);
    } else {
        const promptsRes = await prompts.askForGitIgnoreTypeInput(getTypesRes.data);
        return await projectInitFunctions.addGitIgnore(promptsRes.gitIgnoreType);
    }
}

/**
 * Add a readme for local repo creation
 * @returns Object with success or failure information
 */
exports.addReadMe = async () => {
    const confirmationPromptRes = await prompts.askForConfirmation("Add a README file to the project?");
    const confirmationMessage = confirmationPromptRes.confirmation;
    if(confirmationMessage.toLowerCase() === 'no') return false;

    const projectName = fileHelper.getCurrentDirectoryBase();
    return projectInitFunctions.addReadMe(projectName);
}

/**
 * Handle errors that arise on attempting to commit changes
 * @param {Error} err 
 */
const handleGitCommitError = async(err) => {
    if(err.message.includes("Author identity unknown")) {
        repoPushStatus.stop();
        const gitUserConfigPromptRes = await prompts.askForGitUserConfig();
        const { userEmail, userName } = gitUserConfigPromptRes;

        
        await git.addConfig("user.name", userName, append = true, scope = 'local').catch((e) => console.log(e));
        await git.addConfig("user.email", userEmail, append = true, scope = 'local').catch((e) => console.log(e));

        repoPushStatus.start();
    }
    await git.commit('Initial commit').catch(handleGitCommitError);
}

/**
 * Initialize a local repository, add file, commit and push to remote repo
 * @param {String} url The url for the remote git repository
 * @returns Boolean on success
 */
exports.initializeAndPushRepo = async (url) => {
    repoPushStatus.start();

    try {
        await git.init()
        await git.add('.gitignore')
        await git.add('./*')
        await git.commit('Initial commit').catch(handleGitCommitError)
        await git.branch(["-M", "main"])
        await git.addRemote('origin', url)
        await git.push('origin', 'main')
        
        return true;
    } finally {
      repoPushStatus.stop();
    }
}

/**
 * Update package.json on successfully initializing and pushing repo
 * @param {String} remoteRepoUrl 
 * @returns Object with success or failure information
 */
exports.updatePackageJSON = (remoteRepoUrl) => {
    if(fileHelper.directoryExists('package.json')) {
        const result = fileHelper.readPackageJSONFile();
        if(result.success) {
            const repoInfo = {
                "url": remoteRepoUrl,
                "type": "git"
            };

            let packageFileDetails = result.data;
            packageFileDetails.repository = repoInfo;
            return { ...fileHelper.updatePackageJSONFile(packageFileDetails), containsPackageJson: true };
        } else {
            return { success: false, message: result.message, containsPackageJson: true };
        }
    } else {
        return { success: false, message: "Does not contain package.json", containsPackageJson: false };
    }
}
