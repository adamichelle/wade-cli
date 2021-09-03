const { expect } = require('chai');
const chalk = require('chalk');
const license = require('license');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const fileHelper = require('../lib/utils/fileHelper');
const licenseTexts = require('./data/licenseTexts.json');
const projectInitFunctions = require('../lib/utils/projectInitFunctions');
const prompts = require('../lib/utils/prompts');

const author = 'Test Author';
const projectName = 'test-project';
const projectType = ['Node', 'Python'];

let projectDetails = {
    author: author,
    version: "1.0.0",
    main: "index.js",
    description: "Test project",
    keywords: "test, project",
    testCommand: "mocha",
    license: 'mit'
};

const expectedPackageFileJSONContent = JSON.stringify({
    "name": projectName,
    "version": projectDetails.version,
    "description": projectDetails.description,
    "main": projectDetails.main,
    "scripts": {
      "test": "mocha"
    },
    "keywords": ["test", "project"],
    "author": projectDetails.author,
    "license": projectDetails.license,
}, undefined, 2);

describe('Create Project Folder', function () {
    it('should should make call to change directory if project folder is successfully created', function () {
        const makeDirectoryStub = sinon.stub(fileHelper, 'makeDirectory').returns({ success: true, message: "Project directory successfully created" });
        let chdirStub = sinon.stub(process, 'chdir');

        projectInitFunctions.createProjectFolder('test');

        makeDirectoryStub.restore();
        chdirStub.restore();
        expect(chdirStub.calledOnce).to.be.true;
    });

    it('should return false if project folder is not successfully created', function () {
        const makeDirectoryStub = sinon.stub(fileHelper, 'makeDirectory').returns({ success: false, message: "Error message" });
        let consoleLogStub = sinon.stub(console, 'log');

        const result = projectInitFunctions.createProjectFolder('test');

        makeDirectoryStub.restore();
        consoleLogStub.restore();

        expect(consoleLogStub.calledOnceWith(`${chalk.red("ERROR:")} Unable to create project. \nMessage: Error message.`)).to.be.true;
        expect(result, "Does not return false if project folder is not successfully created").to.be.false;
    })
});

describe('Add Git Ignore', function () {
    it('should return true on successfully adding a gitignore file', async () => {
        let getWritableStub = sinon.stub(fileHelper, 'getWritable');
        let giWriteStub = sinon.stub().resolves();
        const utilStub = { promisify: sinon.stub().callsFake(() => giWriteStub) };
        const projectInitFunctions = proxyquire('../lib/utils/projectInitFunctions', {
            util: utilStub
        });
        let consoleLogStub = sinon.stub(console, 'log');

        const result = await projectInitFunctions.addGitIgnore('Node');

        getWritableStub.restore();
        consoleLogStub.restore();
        
        expect(getWritableStub.calledOnce).to.be.true;
        sinon.assert.called(utilStub.promisify);
        sinon.assert.calledOnce(giWriteStub);
        expect(result).to.be.equal(true);
    });

    it('should return false on error when creating gitignore file', async () => {
        let getWritableStub = sinon.stub(fileHelper, 'getWritable');
        const thrownError = new Error();
        let giWriteStub = sinon.stub().rejects(thrownError);
        const utilStub = { promisify: sinon.stub().callsFake(() => giWriteStub) };
        const projectInitFunctions = proxyquire('../lib/utils/projectInitFunctions', {
            util: utilStub
        });
        let consoleLogStub = sinon.stub(console, 'log');

        const result = await projectInitFunctions.addGitIgnore('Node');

        getWritableStub.restore();
        consoleLogStub.restore();
        
        expect(getWritableStub.calledOnce, "Writable stream was not created").to.be.true;
        sinon.assert.called(utilStub.promisify);
        sinon.assert.calledOnce(giWriteStub);
        expect(result, ".gitignore file was not added successfully.").to.be.equal(false);
    })
});

describe('Add LICENSE File', function () {
    const defaultLicenseName = 'MIT';
    let testLicenseName = 'gnu3';
    let licenseList = [];
    
    beforeEach(function () {
        sinon.stub(console, 'log');
    })

    afterEach(function () {
        console.log.restore()
    })

    it('should create MIT license if licenseList is undefined for some reason', async function () {
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(undefined);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts.MIT);
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });
        
        await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        writeContentToFileStub.restore();

        expect(console.log.calledWith(`${chalk.yellow("WARNING:")} Message: An error occured. Using the default license: ${defaultLicenseName}`), "Warning not logged to the console.").to.be.true;
        expect(writeContentToFileStub.calledWith('LICENSE', licenseTexts.MIT), "MIT license text not called").to.be.true;
    });

    it('should create MIT license if licenseList is empty', async () => {
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(licenseList);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts.MIT);
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });
        
        await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        writeContentToFileStub.restore();

        let findLicenseStubReturnValue = findLicenseStub.returnValues
        expect(findLicenseStubReturnValue[0].length).to.be.equal(0, "Licence list is not empty");
        expect(console.log.calledWith(`${chalk.yellow("WARNING:")} ${testLicenseName.toUpperCase()} license not found. Using the default license: ${defaultLicenseName}`), "Warning not logged to the console.").to.be.true;
        expect(writeContentToFileStub.calledWith('LICENSE', licenseTexts.MIT), "MIT license text not called").to.be.true;
    });

    it('should use the item in licenseList if the length of licenseList is one', async function () {
        licenseList = ["ISC"];
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(licenseList);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts.ISC);
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });
        

        await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        writeContentToFileStub.restore();

        let findLicenseStubReturnValue = findLicenseStub.returnValues;
        expect(findLicenseStubReturnValue[0].length).to.be.equal(1, "Licence list is has less than or more than one license name");
        expect(writeContentToFileStub.calledWith('LICENSE', licenseTexts[licenseList[0]]), `${licenseList[0]} license text not called`).to.be.true;
    });

    it('should allow users to choose from a list of license names that matches their query if licenseList.length > 1 \nand return the text of the license', async function () {
        licenseList = ["ISC", "MIT"];
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(licenseList);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts[licenseList[0]]);
        let promptStub = sinon.stub(prompts, 'askUserToPickLicense').resolves({ license: licenseList[0] })
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });

        await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        promptStub.restore();
        writeContentToFileStub.restore();

        let findLicenseStubReturnValue = findLicenseStub.returnValues;
        expect(findLicenseStubReturnValue[0].length).to.be.greaterThan(1, "Licence list is has less than or just one license name");
        expect(promptStub.calledWith(licenseList), "Prompt asking user to choose a license name was not called with licenseList").to.be.true;
        expect(promptStub.calledOnce, "Prompt asking user to choose a license name was not called").to.be.true;
        expect(writeContentToFileStub.calledWith('LICENSE', licenseTexts[licenseList[0]]), `${licenseList[0]} license text not called`).to.be.true;
    });

    it('should return true if license was created successfully', async function () {
        licenseList = ["MIT"];
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(licenseList);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts.MIT);
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });
        
        const result = await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        writeContentToFileStub.restore();

        expect(console.log.calledWith(`${chalk.blue("INFO:")} LICENSE file successfully added.`), "Success info not logged to the console.").to.be.true;
        expect(result, "License was not written to file successfully").to.be.true;
    });

    it('should return false if an error occured while writing the license', async function () {
        let findLicenseStub = sinon.stub(license, 'findLicense').returns(licenseList);
        let getLicenseStub = sinon.stub(license, 'getLicense').returns(licenseTexts.MIT);
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: false, message: "File not written successfully" });
        
        const result = await projectInitFunctions.addLicense(testLicenseName, author);

        findLicenseStub.restore();
        getLicenseStub.restore();
        writeContentToFileStub.restore();

        expect(console.log.calledWith(`${chalk.red("ERROR:")} An error occured while creating the LICENSE. Message: File not written successfully`), "Error info not logged to the console.").to.be.true;
        expect(result, "License was not written to file successfully").to.be.false;
    });
});

describe('Add README', function () {
    beforeEach(function () {
        sinon.stub(console, 'log');
    })

    afterEach(function () {
        console.log.restore();
    })

    it('should return true on creating README file', function () {
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });

        const result = projectInitFunctions.addReadMe(projectName);

        writeContentToFileStub.restore();

        expect(console.log.calledWith(`${chalk.blue("INFO:")} README file successfully added.`), "Success info not logged to the console.").to.be.true;
        expect(result, "README file creation returned false").to.be.true;
    });

    it('should return false on failing to create README file', function () {
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: false, message: "File not written successfully" });

        const result = projectInitFunctions.addReadMe(projectName);

        writeContentToFileStub.restore();

        expect(console.log.calledWith(`${chalk.red("ERROR:")} An error occured while creating the README. Message: File not written successfully`), "Error info not logged to the console.").to.be.true;
        expect(result, "README file creation returned true").to.be.false;
    });
})

describe('Creating Node Project', function () {
    before(function () {
        sinon.stub(console, 'log');
    });

    after(function () {
        console.log.restore();
    });

    it('should return true on successfully creating a package.json file', function () {
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: true, message: "File written successfully" });

        const result = projectInitFunctions.nodeCreate(projectName, projectDetails);

        writeContentToFileStub.restore();

        expect(writeContentToFileStub.calledWith('package.json', expectedPackageFileJSONContent), "Function not called with expected JSON").to.be.true;
        expect(console.log.calledWith(`${chalk.blue("INFO:")} package.json file successfully added.`), "Success info not logged to the console.").to.be.true;
        expect(result, "Package.json was not created successfully").to.be.true;
    });
    
    it('should return false on failing to create a package.json file because of improper projectDetails formatting', function () {
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile');
        let stringifyStub = sinon.stub(JSON, 'stringify').throws('TypeError');

        const result = projectInitFunctions.nodeCreate(projectName, projectDetails);

        stringifyStub.restore();
        writeContentToFileStub.restore()

        expect(stringifyStub.threw()).to.be.true;
        expect(writeContentToFileStub.notCalled, "").to.be.true;
        expect(console.log.getCall(1).args[0]).to.contain("JSON object formatting", "Formatting error not logged to the console");
        expect(result, "Improperly formatted project details").to.false;
    });

    it('should return false on failing to create a package.json file', function () {
        let writeContentToFileStub = sinon.stub(fileHelper, 'writeContentToFile').returns({ success: false, message: "File not written successfully" });

        const result = projectInitFunctions.nodeCreate(projectName, projectDetails);

        writeContentToFileStub.restore();

        expect(writeContentToFileStub.calledWith('package.json', expectedPackageFileJSONContent), "Function not called with expected JSON").to.be.true;
        expect(console.log.calledWith(`${chalk.red("ERROR:")} An error occured while creating the package.json file. \nMessage: File not written successfully`), "Error info not logged to the console.").to.be.true;
        expect(result, "The file creation did not fail").to.be.false;
    });
});

describe('Create a project', function () {
    before(function () {
        sinon.stub(console, 'log');
    });

    after(function () {
        console.log.restore();
    });

    describe('Node project', function () {     
        it('should return true on successful project creation', function () {
            const nodeCreateStub = sinon.stub(projectInitFunctions, 'nodeCreate').returns(true);

            const result = projectInitFunctions.create(projectType[0], projectName, projectDetails);

            nodeCreateStub.restore();

            expect(result).to.be.true;
        });

        it('should return false on failed project creation', function () {
            const nodeCreateStub = sinon.stub(projectInitFunctions, 'nodeCreate').returns(false);

            const result = projectInitFunctions.create(projectType[0], projectName, projectDetails);

            nodeCreateStub.restore();

            expect(result).to.be.false;
        });
    });
});