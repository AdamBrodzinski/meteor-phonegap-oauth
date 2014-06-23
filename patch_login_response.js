// Patch OAuth._endOfLoginResponse to expose the credentialToken and
// credentialSecret in the url for the InAppBrowser to retrieve.
// See https://groups.google.com/forum/#!topic/meteor-core/Ma3XTZk4Kqg and
// https://github.com/meteor/meteor/blob/3dfcb42eac34f40b6611a0a0a780b9210467ccb2/packages/oauth/oauth_server.js#L219-L255
OAuth._endOfLoginResponse = function (res, details) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    var content = function (setCredentialSecret) {
        return '<html><head><script>' +
            setCredentialSecret +
            'window.close()</script></head></html>';
    };

    if (details.error) {
        Log.warn("Error in OAuth Server: " +
            (details.error instanceof Error ?
                details.error.message : details.error));
        res.end(content(""), 'utf-8');
        return;
    }

    if ("close" in details.query) {
        // If we have a credentialSecret, report it back to the parent
        // window, with the corresponding credentialToken. The parent window
        // uses the credentialToken and credentialSecret to log in over DDP.
        var setCredentialSecret = '';
        if (details.credentials.token && details.credentials.secret) {
            setCredentialSecret = 'var credentialToken = ' +
                JSON.stringify(details.credentials.token) + ';' +
                'var credentialSecret = ' +
                JSON.stringify(details.credentials.secret) + ';' +
                'if (window.opener) window.opener.Package.oauth.OAuth._handleCredentialSecret(' +
                'credentialToken, credentialSecret);' +
                // add the token and secret to the hash
                'else window.location.hash = "credentialToken=" + credentialToken + ' +
                '"&credentialSecret=" + credentialSecret;';
        }
        res.end(content(setCredentialSecret), "utf-8");
    } else {
        res.end("", "utf-8");
    }
};