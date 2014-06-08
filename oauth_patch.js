// Meteor's OAuth flow currently only works with popups. Phonegap does
// not handle this well. Using the InAppBrowser plugin we can load the
// OAuth popup into it. Using the plugin by itself would not work with
// the MeteorRider phonegap method, this fixes it. This has not been
// tested on other Meteor phonegap methods. (tested on PG 3.3, android, iOS)
//
// http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html
// https://github.com/zeroasterisk/MeteorRider
window.patchWindow = function () {

    // Check if the InAppBrowser is loaded.
    var inAppBrowserLoaded = !!(window.cordova && window.cordova.require('org.apache.cordova.inappbrowser.inappbrowser'));
    if (!inAppBrowserLoaded) return false;

    var __open = window.open,
        oauthWin,
        timer;

    // Create an object to return from a monkeypatched window.open call. Handles
    // open/closed state of popup to keep Meteor happy. Allows one to save window
    // reference to a variable and close it later. e.g.,
    // `var foo = window.open('url');  foo.close();
    //
    window.IAB = {
        closed: true,

        open: function (url) {
            // TODO add options param and append to current options
            oauthWin = __open(url, '_blank', 'location=no,hidden=yes');

            oauthWin.addEventListener('loadstop', checkIfOauthIsDone);

            // use hidden=yes as a hack for Android, allows popup to yield events with
            // each #show call. Lets events run on Meteor app, otherwise all listeners
            // will *only* run when tapping done button or oauthWin.close
            //
            // FIXME should be a better way to do this...
            if (device.platform === 'Android') {
                timer = setInterval(oauthWin.show, 200);
            } else {
                oauthWin.show();
            }

            // check if uri contains an error or code param, then manually close popup
            function checkIfOauthIsDone(event) {
                if (!event.url || !event.url.match(/error|code=/)) return;

                oauthWin.executeScript({code: 'document.querySelector("script").innerHTML'}, function (res) {

                    var js = res[0].replace('window.close()', '').replace('window.opener && window.opener.', '');

                    //js = something like:
                    //Package.oauth.OAuth._handleCredentialSecret("RiU_bla_bla_9qQ2", "BtK_bla_bla_4Q");
                    //the first parameter is the "credentialToken" and the second the "credentialSecret"
                    eval(js);

                    //now code similar to this is what would usually be called after the popup closes
                    var credentialToken = js.match(/"(.+)",/)[0].replace(/"/g, '').replace(/,/, '');
                    Accounts.oauth.tryLoginAfterPopupClosed(credentialToken)
                    //TO DO: preserve callback to Meteor.loginWithTwitter(options, callback)
                    //FOR NOW: use Deps.autorun(function() {if(Meteor.user()) //do something});

                    oauthWin.close();
                });

                clearInterval(timer);
                oauthWin.removeEventListener('loadstop', checkIfOauthIsDone)
            }

            this.closed = false;
        },

        close: function () {
            if (!oauthWin) return;
            oauthWin.close();
            this.closed = true;
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

    // Clear patchWindow to prevent it from being called again.
    window.patchWindow = function () {
    };

    return true;
};

// If the InAppBrowser is not loaded yet wait until cordova is finished loading.
if (!window.patchWindow()) document.addEventListener('deviceready', window.patchWindow, false);