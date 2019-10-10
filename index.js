const express = require('express');
const app = express();
const fs = require('fs');

const config = fs.readFileSync('./config/config.json');
const AppleAuth = require('./apple-auth');
const crypto = require('crypto');

let auth = new AppleAuth(config, './config/AuthKey.p8');

app.get("/", (req, res) => {
	const state = crypto.randomBytes(5).toString('hex');
        res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
});

app.get('/oauth/redirect', async (req, res) => {
    try {
        const accessToken = await auth.accessToken(req.query.code);
        res.json(accessToken);
	console.log("statusCode: "+res.statusCode);
    } catch (ex) {
        console.error(ex);
        res.send("An error occurred!");
    }
});

app.listen(3000, () => {
    console.log("Listening on https://casesecurities.com/apple");
})
