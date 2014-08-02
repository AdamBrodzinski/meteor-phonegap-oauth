var document = function (script) {
    return '<html>' +
        '<head>' +
        '<script type="text/javascript">'
        + script +
        'window.close();' +
        '</script>' +
        '</head>' +
        '<body></body>' +
        '</html>';
};

var credentialSecretScript = function (token, secret) {
    token = JSON.stringify(token || '');
    secret = JSON.stringify(secret || '');

    return 'var credentialToken = ' + token + ', credentialSecret = ' + secret + ';' +

        // compatibility for our patch_window.js
        // add the token and secret to the hash
        'window.location.hash = "credentialToken=" + credentialToken + "&credentialSecret=" + credentialSecret;' +

        // compatibility with chrome for iOS, meteor >= v0.8.3
        // see https://github.com/meteor/meteor/commit/82368547365c6c218327e40697c5be0b7f18ff0a
        'try { localStorage["Meteor.oauth."+ credentialToken] = credentialSecret; } catch (err) { }' +

        // compatibility with meteor >= 0.8.3
        'window.opener && window.opener.Package.oauth.OAuth._handleCredentialSecret( credentialToken, credentialSecret);';
};

// Patch OAuth._endOfLoginResponse to expose the credentialToken and
// credentialSecret in the url for the InAppBrowser to retrieve.
// See https://groups.google.com/forum/#!topic/meteor-core/Ma3XTZk4Kqg and
// https://github.com/meteor/meteor/blob/3dfcb42eac34f40b6611a0a0a780b9210467ccb2/packages/oauth/oauth_server.js#L219-L255
OAuth._endOfLoginResponse = function (res, details) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    if (details.error) {
        Log.warn('Error in OAuth Server: ' +
            (details.error instanceof Error ? details.error.message : details.error));

        res.end(document(''), 'utf-8');
        return;
    }

    if ('close' in details.query) {
        var script = '',
            token = details.credentials.token,
            secret = details.credentials.secret;

        // If we have a credentialSecret, report it back to the parent
        // window, with the corresponding credentialToken. The parent window
        // uses the credentialToken and credentialSecret to log in over DDP.
        if (token && secret) {
            script = credentialSecretScript(token, secret);
        }

        res.end(document(script), 'utf-8');
    } else {
        res.end('', 'utf-8');
    }
};