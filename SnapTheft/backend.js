// Imports
const config = require("./config.json");
const passport = require('passport');
const multer = require('multer');
const bodyParser = require('body-parser');
const session  = require('express-session');
const express = require("express");
const flash  = require('express-flash');
const chalk = require('chalk');
const figlet = require('figlet');
const utils = require('hyperz-utils');
const pjson = require('./package.json');
const axios = require('axios');
const bcrypt = require('bcrypt');

// Basic Variable Setup
let projectName = 'SnapTheft'
let pubApiURL = `https://raw.githubusercontent.com/Itz-Hyperz/version-pub-api/main/versions.json`;
let storedAppVariable;

// Init Function
async function init(app, con) {
    if (Number(process.version.slice(1).split(".")[0] < 16)) throw new Error(`Node.js v16 or higher is required, Discord.JS relies on this version, please update @ https://nodejs.org`);
    var multerStorage = multer.memoryStorage(); // req.body setup
    app.use(multer({ storage: multerStorage }).any()); // req.body setup
    app.use(bodyParser.urlencoded({ extended: false })); // req.body setup
    app.use(express.json()); // req.body setup
    app.set('views', './src/views'); // setting views folder
    app.set('view engine', 'ejs'); // setting views engine
    app.use(express.static('public')); // making public folder "public"
    app.use(express.static('src/static')); // making static folder "public"
    app.use('/assets', express.static(__dirname + 'public/assets')); // creating shortcut
    app.use('/static', express.static(__dirname + 'src/static/assets')); // creating shortcut
    // BEGIN FANCY CONSOLE LOGGING STUFF
    figlet.text(projectName, { font: "Standard", width: 700 }, function(err, data) {
        if(err) throw err;
        let str = `${data}\n-------------------------------------------\n${projectName} is up and running on port ${config.port}!`
        console.log(chalk.bold(chalk.yellowBright(str)));
    });
    await resetAppLocals(app); // Reset app locals to be ready for next render (do this on every page load)
};

// Keeps settings updated for next render
async function resetAppLocals(app) {
    app.locals = {
        config: config,
        packagejson: require('./package.json'),
    };
    storedAppVariable = app;
};

// Generates a user Id for non-oauth2 users
function generateUserId(length) {
    let result           = '';
    let characters       = '0123456789';
    let date             = Date.now();
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return date + result;
};

// Module Exports
module.exports = {
    init: init,
    generateUserId: generateUserId,
    resetAppLocals: resetAppLocals
};
