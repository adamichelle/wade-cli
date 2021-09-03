const fs = require('fs');
const path = require('path');

module.exports = {
    /**
     * Get the project folder name
     * @returns String The project folder name
     */
    getCurrentDirectoryBase: () => {
        return path.basename(process.cwd());
    },
    
    /**
     * Check if a file path exists
     * @param {String} filePath The file path to check if it exists
     * @returns Boolean indicating whther the file path exists or not
     */
    directoryExists: (filePath) => {
        return fs.existsSync(filePath);
    },

    /**
     * Create a directory
     * @param {String} name Name of the directory to create
     * @returns 
     */
    makeDirectory: (name) => {
        try {
            fs.mkdirSync(name)
            return { success: true, message: "Project directory successfully created" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Create a file and get the writable stream
     * @param {String} name The file name
     * @returns Writable stream for the file
     */
    getWritable: (name) => {
        return fs.createWriteStream(name);
    },

    /**
     * Write content to a file with a name
     * @param {String} fileName Name of the file
     * @param {Object} content Content to write to the file
     * @returns Object with success or failure information
     */
    writeContentToFile: (fileName, content) => {
        try {
            fs.writeFileSync(fileName, content);
            return { success: true, message: "File written successfully" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    /**
     * Read a package.json file
     * @returns Object with success or failure information
     */
    readPackageJSONFile: () => {
        try {
            const fileContent = fs.readFileSync('package.json', 'utf-8');
            const jsonContent = JSON.parse(fileContent);
            return { success: true, data: jsonContent, message: "package.json file read successfully" };
        } catch (error) {
            return { success: false, data: null, message: error.message }
        }
    },

    /**
     * Update a package.json file
     * @returns Object with success or failure information
     */
    updatePackageJSONFile: (content) => {
        try {
            const stringifiedContent = JSON.stringify(content, undefined, 2);
            fs.writeFileSync('package.json', stringifiedContent);
            return { success: true, message: "package.json file updated successfully" };
        } catch (error) {
            return { success: false, message: error.message }
        }
    }
}
