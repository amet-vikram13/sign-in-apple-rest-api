const axios = require('axios');
const AppleClientSecret = require("./token");
const crypto = require('crypto');
const qs = require('querystring');

class AppleAuth 
{
    
    constructor(config, privateKeyLocation) 
    {
        this._config = JSON.parse(config);
        this._state = "";
        this._tokenGenerator = new AppleClientSecret(this._config, privateKeyLocation);
        this.loginURL = this.loginURL.bind(this);
    }

    get state () 
    {
        return this._state;
    }

    loginURL() 
    {
        this._state = crypto.randomBytes(5).toString('hex');
        const url = "https://appleid.apple.com/auth/authorize?"
                    + "response_type=code"
                    + "&client_id=" + this._config.client_id
                    + "&redirect_uri=" + this._config.redirect_uri
                    + "&state=" + this._state
        return url;
    }
    
    accessToken(code) 
    {
        return new Promise (
            (resolve, reject) => 
            {
                this._tokenGenerator.generate().then((token) => {
                    const payload = {
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: this._config.redirect_uri,
                        client_id: this._config.client_id,
                        client_secret: token,
			            scope: "email name"
                    };
                    axios({
                        method: 'POST',
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: qs.stringify(payload),
                        url: 'https://appleid.apple.com/auth/token'
                    }).then((response) => {
                        resolve(response.data);
                    }).catch((response) => {
                        reject("AppleAuth Error - An error occurred while getting response from Apple's servers: " + response);
                    });
                }).catch((err) => {
                    reject(err);
                });
            }
        );
    }

}

module.exports = AppleAuth;
