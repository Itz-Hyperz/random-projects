// Basic Imports
const config = require("./config.json");
const express = require("express");
const app = express();
const chalk = require('chalk');

// MySQL Setup
const mysql = require('mysql');
config.sql.charset = "utf8mb4";
let con = 0; // set = 0 to disable

// Backend Initialization
const backend = require('./backend.js');
backend.init(app, con);

// Discord Login Passport
const passport = require('passport');
const DiscordStrategy = require('passport-discord-hyperz').Strategy;
passport.serializeUser(function(user, done) { done(null, user) });
passport.deserializeUser(function(obj, done) { done(null, obj) });
passport.use(new DiscordStrategy({
    clientID: config.discord.oauthId,
    clientSecret: config.discord.oauthToken,
    callbackURL: `${(config.domain.endsWith('/') ? config.domain.slice(0, -1) : config.domain)}/auth/discord/callback`,
    scope: ['identify', 'guilds', 'email'],
    prompt: 'consent'
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

var pageViews = 127;
var releaseEm = false;
const countDown = () => {
    const launchDate = new Date('22 February, 2026 00:00:00').getTime();
    const presentDate = new Date().getTime();
    const difference = launchDate - presentDate;

    // Get the second, minute,hour, day
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    const dayText = Math.floor(difference / day);
    const hourText = Math.floor((difference % day) / hour);
    const minuteText = Math.floor((difference % hour) / minute);
    const secondText = Math.floor((difference % minute) / second);
    //   add text to the html document or dom
    if(minuteText == '-1' && hourText == '-6' && dayText == '-1' && secondText == '-1') { // due to a programming delay, 0, 0, 0, 0 is actually -1, -6, -1, -1 on this machine. you will need to console log the time zones and compare for both functions in order to get YOUR exact time difference.
        releaseEm = true; // This enables the files for aslong as the program runs AFTER The countdown, after program restart this will reset back to false if the launch date is not updated to a date/time in the future.
    };
 };

 setInterval(countDown, 1000);

// Routing
app.get('', async function(req, res) {
    pageViews = pageViews + 1;
    if(releaseEm) {
        res.render('files.ejs', { loggedIn: req.isAuthenticated() });
    } else {
        res.render('index.ejs', { pageViews: pageViews, loggedIn: req.isAuthenticated() });
    };
});

app.get('/discorduserdata', backend.checkAuth, async function(req, res) {
    res.type('json').send(JSON.stringify(req.session.passport.user, null, 4) + '\n');
});

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/'}), async function(req, res) {
    req.session?.loginRef ? res.redirect(req.session.loginRef) : res.redirect('/');
    delete req.session?.loginRef
});

// MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
app.get('*', function(req, res){
    res.render('404.ejs');
});

// Server Initialization
app.listen(config.port)
console.log(chalk.blue('ExpressJS Web Application Started on Port ' + config.port));

// Rejection Handler
process.on('unhandledRejection', (err) => { 
    if(config.debugMode) console.log(chalk.red(err));
});
