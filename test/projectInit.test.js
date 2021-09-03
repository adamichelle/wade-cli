const { expect } = require('chai');
const chalk = require('chalk');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const projectTypes = ['Node', 'Python'];
const projectName = 'test-project';
const options = { license: 'mit' };
let projectDetails = {
    author: "Test Author",
    version: "1.0.0",
    main: "index.js",
    description: "Test project",
    keywords: "test, project",
    testCommand: "mocha"
};

describe('Project Init', function () {
    let projectInitFunc, allStubs; 
    let projectTypePromptStub, projectDetailsNodePromptStub, gitInitPromptStub, promptsStub;
    let fileHelperStub, directoryExistsFuncStub;
    let projectInitFunctionsStubs, createStub, createFolderStub, addGitIgnoreStub, addLicenseStub, addReadmeStub;

    beforeEach(function () {
        projectTypePromptStub = sinon.stub().resolves({ projectType: projectTypes[0] });
        projectDetailsNodePromptStub = sinon.stub().resolves({ projectDetails: projectDetails });
        gitInitPromptStub = sinon.stub().resolves({ initGit: 'no' });

        promptsStub = { 
            askProjectType: sinon.stub().callsFake(() => projectTypePromptStub()),
            askNodeProjectDetails: sinon.stub().callsFake(() => projectDetailsNodePromptStub()),
            askForGitInitialization: sinon.stub().callsFake(() => gitInitPromptStub())
        }

        directoryExistsFuncStub = sinon.stub().returns(false);

        fileHelperStub = {
            directoryExists: sinon.stub().callsFake(() =>  directoryExistsFuncStub()),
        }

        createFolderStub = sinon.stub().returns(true);
        addGitIgnoreStub = sinon.stub().resolves(true);
        addLicenseStub = sinon.stub().resolves(true);
        addReadmeStub = sinon.stub().returns(true);
        createStub = sinon.stub().returns(true);

        projectInitFunctionsStubs = {
            createProjectFolder: sinon.stub().callsFake(() => createFolderStub()),
            addGitIgnore: sinon.stub().callsFake(() => addGitIgnoreStub()),
            addLicense: sinon.stub().callsFake(() => addLicenseStub()),
            addReadMe: sinon.stub().callsFake(() => addReadmeStub()),
            create: sinon.stub().callsFake(() => createStub())
        };

        allStubs = {
            './utils/prompts': promptsStub,
            './utils/fileHelper': fileHelperStub,
            './utils/projectInitFunctions': projectInitFunctionsStubs
        }

        projectInitFunc = proxyquire.noCallThru().load('../lib/projectInit', allStubs);

        sinon.stub(console, 'log');
        sinon.stub(process, 'exit');
    });

    afterEach(function () {
        console.log.restore();
        process.exit.restore();
    })

    it('should exit if a directory with the project name exists', async () => {
        directoryExistsFuncStub = sinon.stub().returns(true);

        fileHelperStub.directoryExists = sinon.stub().callsFake(() =>  directoryExistsFuncStub())

        allStubs['./utils/fileHelper'] = fileHelperStub;
        projectInitFunc = proxyquire.noCallThru().load('../lib/projectInit', allStubs);
        await projectInitFunc(projectName, options);

        expect(fileHelperStub.directoryExists.called).to.be.true;
        expect(promptsStub.askNodeProjectDetails.called).to.be.false;
        expect(console.log.calledWith(`${chalk.red("ERROR:")} There is already a folder with the same name!`), "Error info not logged to the console.").to.be.true;
    });

    it('should prompt user to enter package details and attempt to create project folder if project type is Node', async function () {
        await projectInitFunc(projectName, options);
        expect(promptsStub.askNodeProjectDetails.called, 'Prompt was not provided').to.be.true;
        expect(console.log.calledWith(`\nCreating a new ${projectTypes[0]} project in ${chalk.yellow(`~/${projectName}`)}...\n`), "Progress Info not logged to the console.").to.be.true;
        expect(projectInitFunctionsStubs.createProjectFolder.called, 'No attempt to create project folder').to.be.true;
    });

    it('should return if attempt to create folder fails', async function () {
        createFolderStub = sinon.stub().returns(false);
        projectInitFunctionsStubs.createProjectFolder = sinon.stub().callsFake(() => createFolderStub())
        allStubs['./utils/projectInitFunctions'] = projectInitFunctionsStubs;
        projectInitFunc = proxyquire.noCallThru().load('../lib/projectInit', allStubs);
        
        await projectInitFunc(projectName, options);
        
        expect(projectInitFunctionsStubs.addGitIgnore.called, 'Attempt to create project folder succeeds').to.be.false;
    });

    it('should indicate that project was created successfully', async function () {
        await projectInitFunc(projectName, options);
        
        expect(console.log.calledWith(`\nSuccess! Created a ${projectTypes[0]} project in ~/${projectName}.`), "Success info not logged to the console.").to.be.true;
        //expect(promptsStub.askForGitInitialization.called, "User not prompted to initializze git repo").to.be.true;
    });
});
