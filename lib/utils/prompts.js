const inquirer = require('inquirer');
const fileHelper = require('./fileHelper');

module.exports = {
    askProjectType: () => {
        const question = [{
            name: 'projectType',
            type: 'list',
            message: 'Select a project type. If you do not select any, a NodeJS project will be created.',
            choices: ['Node', 'Python'],
            default: 'Node'
        }];
        return inquirer.prompt(question);
    },

    askNodeProjectDetails: () => {
        const questions = [{
            name: 'author',
            type: 'input',
            message: 'Your name: '
        }, {
            name: 'version',
            type: 'input',
            message: 'Project version number:',
            default: '1.0.0'
        }, {
            name: 'main',
            type: 'input',
            message: 'Entry point for your project:',
            default: 'index.js'
        }, {
            name: 'description',
            type: 'input',
            message: 'Project description:'
        }, {
            name: 'keywords',
            type: 'input',
            message: 'Project keywords separated by comma:'
        }, {
            name: 'testCommand',
            type: 'input',
            message: 'Test command:'
        }];

        return inquirer.prompt(questions);
    },

    askUserToPickLicense: (licenseList) => {
        const questions = [
            {
              type: 'list',
              name: 'license',
              message: 'License:',
              choices: licenseList,
              default: 'MIT'
            }
        ];
        return inquirer.prompt(questions);
    },

    askForGitInitialization: () => {
        const question = [{
            type: 'input',
            name: 'initGit',
            message: 'Initialize a git repository in this folder?',
            choices: ['Yes', 'No'],
            default: 'No'
        }];
        
        return inquirer.prompt(question);
    },

    askGithubCredentials: () => {
        const question = [
          {
            name: 'personalAccessToken',
            type: 'input',
            message: '\nEnter your github personal access token:',
            validate: function(value) {
              if (value.length) {
                return true;
              } else {
                return `Please enter your personal access token:`;
              }
            },
            prefix: 'Login to your Github account. \nGo to Settings > Developer Settings > Personal Access Token. \nClick on \'Generate new token\''
          }
        ];
        return inquirer.prompt(question);
    },

    askForRepoInfo: () => {
        const questions = [
            {
              type: 'input',
              name: 'repoName',
              message: 'Enter a name for the repository:',
              default: fileHelper.getCurrentDirectoryBase(),
              validate: function( value ) {
                if (value.length) {
                  return true;
                } else {
                  return 'Please enter a name for the repository.';
                }
              }
            },
            {
              type: 'input',
              name: 'repoDescription',
              message: 'Optionally enter a description of the repository:'
            },
            {
              type: 'list',
              name: 'repoVisibility',
              message: 'Public or private:',
              choices: [ 'public', 'private' ],
              default: 'public'
            }
        ];
        return inquirer.prompt(questions);
    },

    askForRepoVisibility: () => {
        const question = [
            {
              type: 'list',
              name: 'repoVisibility',
              message: 'Public or private:',
              choices: [ 'public', 'private' ],
              default: 'public'
            }
        ];
        return inquirer.prompt(question);
    },

    askForGitIgnoreType: (types) => {
        const question = [
            {
                type: 'list',
                name: 'gitIgnoreType',
                message: 'Select a .gitignore template:',
                choices: types,
                validate: function( value ) {
                    if (value.length) {
                      return true;
                    } else {
                      return 'Please select a .gitignore template.';
                    }
                }
            }
        ]

        return inquirer.prompt(question);
    },

    askForGitIgnoreTypeInput: () => {
        const question = [{
            name: 'gitIgnoreType',
            type: 'input',
            message: 'Enter a template name:',
            validate: function( value ) {
                if (value.length) {
                  return true;
                } else {
                  return 'Please enter a template name.';
                }
            }
        }];
        
        return inquirer.prompt(question);
    },

    askForGitUserConfig: () => {
      const questions = [
        {
          type: "input",
          name: "userEmail",
          message: "Enter your github email (e.g. you@example.com):",
          validate: function (value) {
            if(value.length) {
              return true;
            } else {
              return "Please enter your github email:";
            }
          }
        },
        {
          type: "input",
          name: "userName",
          message: "Enter your name (e.g. Jane Doe):",
          validate: function (value) {
            if(value.length) {
              return true;
            } else {
              return "Please enter your name:";
            }
          }
        }
      ];

      return inquirer.prompt(questions);
    },
    askForConfirmation: (message) => {
      const question = [{
          type: 'list',
          name: 'confirmation',
          message: `${message}`,
          choices: ['Yes', 'No'],
          default: 'Yes'
      }];
      
      return inquirer.prompt(question);
  }
}