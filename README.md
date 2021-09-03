# wade-cli
A tech bro's command line personal assistant.

As a newbie, I found myself going back to this article on [How to start a Node.js project](https://philna.sh/blog/2019/01/10/how-to-start-a-node-js-project/) by Phil Nash for commands to set up my project environment. At some point I lost the link and had to search on Google for it again. It was that useful. Recently, I came across [yoda](https://manparvesh.com/project/yoda/) - a CLI based 'personal assistant' written in Python by Man Parvesh Singh Randhawa. I thought it was really cool. Inspired by the project, I wanted to create something similar but with Node.js and more development-oriented. So, I decided to automate the steps Phil Nash talked about in the article with Node.js. Additionally, I decided to automate GitHub repository creation workflow.

## Features
- Project starter folder generator: Generation of unopinionated NodeJS and Python project starter folders with .gitignore, README.md, LICENSE and package.json (for NodeJS projects) files.
- Automated GitHub repository creation workflow: Set up a repository from the command line without visiting the browser. Initialization of git within specified a folder, adding the remote repository and pushing the local git main branch to the remote repository.

Currently, it supports two commands:
- `create-project|cp [options] <project-name>`
- `setup-github-repo|sgr`

### Options for `create-project`:
  
`-l, --license <name>` The open source license you want to use (default: "MIT")
  
`-h, --help` display help for command

## Usage example
1. Creating a project
```bash
wade create-project test --license mit

## or

wade cp test -l mit
```

2. Setting up GitHub repo
```bash
wade setup-github-repo

## or
wade sgr
```

3. Help
```bash
wade --help

## or
wade create-project --help

## or
wade setup-github-repo --help
```

## Setup and Installation
This project is not yet available as an npm package as I am still working on adding more commands and featues so it cannot be accessed by calling `npm install <package-name>`. 

If you would like to try it out, you can follow the steps found in the [installation](#installation) section below.

### Requirements
For the commands to work correctly and features to behave as intended you need to have the following installed:
- [Node.js](https://nodejs.org/en/download/) v >=14
- [Git](https://git-scm.com/downloads)

### Installation
1. First, **fork** and clone the repository to your local machine:
```
git clone 
```

2. Change the current working directory:
```
cd wade-cli
```

3. Then install the package dependencies:
```
npm install
```

4. Finally, from within the `wade-cli` cloned project folder, run:
```
npm install -g ./
```
Doing this install the project globally for you on your machine allowing you to use the `wade` command from any directory.

## Feature ideas
- [x] Project starter folder generator
- [x] Automate GitHub repository creation workflow
- [] Refresh github access token.
- [] Allow users to be able to only create remote repo from terminal without making any git actions locally.