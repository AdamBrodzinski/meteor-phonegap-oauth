// Meteor's OAuth flow currently only works with popups. Phonegap does
// not handle this well. Using the InAppBrowser plugin we can load the
// OAuth popup into it. Using the plugin by itself would not work with
// the MeteorRider phonegap method, this fixes it. This has not been
// tested on other Meteor phonegap methods. (tested on PG 3.3, android,iOS)
//
// http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html
// https://github.com/zeroasterisk/MeteorRider

var __open = window.open,
    IAB,
    oauthWin,
    timer;

// Create an object to return from a monkeypatched window.open call. Handles
// open/closed state of popup to keep Meteor happy. Allows one to save window
// referrence to a variable and close it later. e.g.,
// `var foo = window.open('url');  foo.close();
//
IAB = {
  closed: true,

  open: function(url) {
    var self = this;

    // TODO add options param and append to current options
    oauthWin = __open(url, '_blank', 'location=no,hidden=yes');

    oauthWin.addEventListener('loadstop', checkIfOauthIsDone);

    // use hidden=yes as a hack for Android, allows popup to  yield events with
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

      clearInterval(timer);
      oauthWin.removeEventListener('loadstop', checkIfOauthIsDone);
      self.close();
    }

    this.closed = false;
  },

  close: function() {
    if (!oauthWin) return;
    oauthWin.close();
    this.closed = true;
  }
};
  
// monkeypatch window.open on the phonegap platform
if (typeof device !== "undefined") {
  window.open = function(url) {
    IAB.open(url);
    // return InAppBrowser so you can set foo = open(...) and then foo.close()
    return IAB;
  };
}

