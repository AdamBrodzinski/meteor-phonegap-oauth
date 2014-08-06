// Meteor's OAuth flow currently only works with popups. Phonegap does
// not handle this well. Using the InAppBrowser plugin we can load the
// OAuth popup into it. Using the plugin by itself would not work with
// the MeteorRider phonegap method, this fixes it. This has not been
// tested on other Meteor phonegap methods. (tested on PG 3.3, android, iOS)
//
// http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html
// https://github.com/zeroasterisk/MeteorRider
window.patchWindow = function () {
    // Prevent the window from being patched twice.
    if (window.IAB) return;

    // Make sure the InAppBrowser is loaded before patching the window.
    try {
        window.cordova.require('org.apache.cordova.inappbrowser.inappbrowser');
    } catch (e) {
        return false;
    }

    // Keep a reference to the original window.open.
    var __open = window.open,
        oauthWin,
        checkMessageInterval;

    // Create an object to return from a monkeypatched window.open call. Handles
    // open/closed state of popup to keep Meteor happy. Allows one to save window
    // reference to a variable and close it later. e.g.,
    // `var foo = window.open('url');  foo.close();
    window.IAB = {
        closed: true,

        open: function (url) {
            // Do not allow multiple in app browsers to be open.
            if (!this.closed) return;

            // XXX add options param and append to current options
            oauthWin = __open(url, '_blank', 'location=no,hidden=yes');

            oauthWin.addEventListener('loadstop', checkIfOauthIsDone);

            // Close the InAppBrowser on exit -- triggered when the
            // user goes back when there are not pages in the history.
            oauthWin.addEventListener('exit', close);

            oauthWin.show();

            // Plugin messages are not processed on Android until the next
            // message this prevents the oauthWin event listeners from firing.
            // Call exec on an interval to force process messages.
            // http://stackoverflow.com/q/23352940/230462 and
            // http://stackoverflow.com/a/24319063/230462
            if (device.platform === 'Android') {
                checkMessageInterval = setInterval(function () {
                    cordova.exec(null, null, '', '', [])
                }, 200);
            }

            function close() {
                clearTimeout(checkMessageInterval);

                // remove the listeners
                oauthWin.removeEventListener('loadstop', checkIfOauthIsDone);
                oauthWin.removeEventListener('exit', close);

                // close the window
                IAB.close();
            }

            // check if uri contains an error or code param, then manually close popup
            function checkIfOauthIsDone(event) {
                // if this is the oauth prompt url, we are not done
                if (url === event.url) return;

                if (!event.url || event.url.indexOf('redirect_uri') > -1 || !event.url.match(/close|error|code=/)) return;

                if (event.url.indexOf('credentialToken') > -1) {
                    // Get the credentialToken and credentialSecret from the InAppBrowser's url hash.
                    var hashes = event.url.slice(event.url.indexOf('#') + 1).split('&');
                    var credentialToken = hashes[0].split('=')[1];

                    if (event.url.indexOf('credentialSecret') > -1) {
                        var credentialSecret = hashes[1].split('=')[1];
                        OAuth._handleCredentialSecret(credentialToken, credentialSecret);
                    }

                    Accounts.oauth.tryLoginAfterPopupClosed(credentialToken);
                }

                close();
            }

            this.closed = false;
        },

        // Expose the original window.open.
        __open: __open,

        close: function () {
            this.closed = true;

            if (oauthWin) {
                oauthWin.close();
                oauthWin = null;
            }
        }
    };

    // monkeypatch window.open on the phonegap platform
    if (typeof device !== "undefined") {
        window.open = function (url) {
            IAB.open(url);
            // return InAppBrowser so you can set foo = open(...) and then foo.close()
            return IAB;
        };
    }

    return true;
};

// Patch the window after cordova is finished loading
// if the InAppBrowser is not available yet.
if (!window.patchWindow()) document.addEventListener('deviceready', window.patchWindow, false);
