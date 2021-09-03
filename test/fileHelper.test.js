const { expect } = require('chai');
const fs = require('fs');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { 
    directoryExists, 
    makeDirectory, 
    writeContentToFile, 
    readPackageJSONFile,
    updatePackageJSONFile
} = require('../lib/utils/fileHelper');

const testDirectoryName = 'test-project';
const nonExistentDirectory = '/blah/blahh';
const testString = "Hi. This is a test string";
const testFileName = "test.txt";

describe('Make Directory', function () {
    it('should create a directory', function () {
        const response = makeDirectory(testDirectoryName);
        expect(response.success).to.equal(true);
        expect(response.message).to.equal("Project directory successfully created", "Project directory was not created");
    });

    it('should not create a directory when a wrong path is given', function () {
        const response = makeDirectory(nonExistentDirectory);
        expect(response.success).to.equal(false);
        expect(response.message).to.contain('ENOENT', "The wrong file path was provided");
    });
});

describe('Check for existing directory', function () {
    it('should return true if directory exists', function () {
        const doesDirectoryExist = directoryExists(testDirectoryName);
        expect(doesDirectoryExist).to.equal(true, "Directory exists")
    })

    it('should return false if directory does not exists', function () {
        const doesDirectoryExist = directoryExists('none-existent-project');
        expect(doesDirectoryExist).to.equal(false, "Directory does not exist")
    })
})

describe('Write to file', function () {
    it('should write content to file and return success', function () {
        const result = writeContentToFile(testFileName, testString);
        const fileContent = fs.readFileSync(testFileName, 'utf-8');
        expect(fileContent).to.equal(testString, "Content was not written to file successfully");
        expect(result.success).to.equal(true);
        expect(result.message).to.equal("File written successfully", "Content was not written to file successfully");
    });

    it('should not write content to file if it has a wrong path', function () {
        const result = writeContentToFile(`non-existent-dir/${testFileName}`, testString);
        expect(result.success).to.equal(false);
        expect(result.message).to.contain('ENOENT', "The wrong file path was provided");
    })
});

describe('Helpers for package.json files', function () {
    const testErrorMessage = "Test error"
    const thrownError = new Error(testErrorMessage);

    describe('Read package.json file helper', function () {
        it('should read a JSON object from package.json file', function () {
            const fileContent = readPackageJSONFile().data;
            expect(fileContent).to.be.an('object');
        });

        it('should return false and not return a JSON object from package.json file if a fs error happens', function () {
            let fsReadFileSyncStub = sinon.stub().throws(thrownError);
            const fsStub = { readFileSync: sinon.stub().callsFake(() => fsReadFileSyncStub()) };
            const fileHelper = proxyquire('../lib/utils/fileHelper', {
                fs: fsStub
            });

            const result = fileHelper.readPackageJSONFile();

            sinon.assert.called(fsStub.readFileSync);sinon.assert.calledOnce(fsReadFileSyncStub);
            expect(result.success, "Function returned true.").to.be.equal(false);
            expect(result.message, "Function call returns a wrong message.").to.be.equal(testErrorMessage);
            expect(result.data, "Function does not return null").to.be.null;
        });

        it('should return false and not return a JSON object from package.json file if a JSON.parse error happens', function () {
            let fsReadFileSyncStub = sinon.stub().throws(thrownError);
            const fsStub = { readFileSync: sinon.stub().callsFake(() => fsReadFileSyncStub) };
            const fileHelper = proxyquire('../lib/utils/fileHelper', {
                fs: fsStub
            });

            const jsonParseStub = sinon.stub(JSON, 'parse').throws(thrownError);

            const result = fileHelper.readPackageJSONFile();

            jsonParseStub.restore();

            sinon.assert.called(fsStub.readFileSync);
            sinon.assert.calledOnce(jsonParseStub);
            expect(result.success, "Function returned true.").to.be.equal(false);
            expect(result.message, "Function call returns a wrong message.").to.be.equal(testErrorMessage);
            expect(result.data, "Function does not return null").to.be.null;
        });
    });

    
    describe('Update package.json file helper', function () {
        const testContent = {
            "name": "test"
        }
        const stringifiedContent = JSON.stringify();

        it('should return true on successful update', function () {
            let fsWriteFileSyncStub = sinon.stub();
            const fsStub = { writeFileSync: sinon.stub().callsFake(() => fsWriteFileSyncStub) };
            const fileHelper = proxyquire('../lib/utils/fileHelper', {
                fs: fsStub
            });

            const jsonStringifyStub = sinon.stub(JSON, 'stringify');

            const result = fileHelper.updatePackageJSONFile(testContent);

            jsonStringifyStub.restore();

            sinon.assert.called(fsStub.writeFileSync);
            sinon.assert.called(jsonStringifyStub);
            sinon.assert.calledWith(jsonStringifyStub, testContent, undefined, 2);
            sinon.assert.calledWith(fsStub.writeFileSync, 'package.json', stringifiedContent);
            expect(result.success, "Function returned false.").to.be.equal(true);
        });

        it('should return false if JSON.stringify throws an error', function () {
            const jsonStringifyStub = sinon.stub(JSON, 'stringify').throws(thrownError);

            const result = updatePackageJSONFile(testContent);

            jsonStringifyStub.restore();

            sinon.assert.called(jsonStringifyStub);
            sinon.assert.calledWith(jsonStringifyStub, testContent, undefined, 2);
            expect(result.success, "Function returned false").to.be.false;
            expect(result.message, "Function didn't return failure message").to.be.equal(testErrorMessage);
        });

        it('should return false if fs throws an error', function () {
            const jsonStringifyStub = sinon.stub(JSON, 'stringify');
            let fsWriteFileSyncStub = sinon.stub().throws(thrownError);
            const fsStub = { writeFileSync: sinon.stub().callsFake(() => fsWriteFileSyncStub()) };
            const fileHelper = proxyquire('../lib/utils/fileHelper', {
                fs: fsStub
            });

            const result = fileHelper.updatePackageJSONFile(testContent);

            jsonStringifyStub.restore();

            sinon.assert.called(jsonStringifyStub);
            sinon.assert.calledWith(jsonStringifyStub, testContent, undefined, 2);
            sinon.assert.called(fsStub.writeFileSync);
            sinon.assert.calledWith(fsStub.writeFileSync, 'package.json', stringifiedContent);
            expect(result.success, "Function returned true").to.be.false;
            expect(result.message, "Function didn't return failure message").to.be.equal(testErrorMessage);
        });
    });
});

after(function () {
    try {
        fs.rmdirSync(testDirectoryName);
        fs.unlinkSync(testFileName)
    } catch (error) {
        console.error(error)
    }
})
