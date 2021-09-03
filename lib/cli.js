const chalk = require('chalk');
const { Command } = require('commander');

const { mainHelpText } = require('./utils/helpText');
const projectInit = require('./projectInit');

exports.cli = async function (args) {
    console.log(chalk.italic(mainHelpText))

    const program = new Command();
    program.name("wade");
    program.version('1.0.0');

    program
    .command('create-project <project-name>')
    .alias('cp')
    .description(chalk.greenBright('Start a new project'))
    .option('-l, --license <name>', 'The open source license you want to use', 'MIT')
    .action(async (projectName, options) => {
        await projectInit(projectName, options)
    });

    program
    .command('setup-github-repo')
    .alias('sgr')
    .description(chalk.greenBright('Initialize a git repository and push to a remote Github repo'))
    .action(async () => {
        console.log("coming soon!")
    });


    program.parse(args);

    if(!program.args.length) {
        program.help();
    }
};
