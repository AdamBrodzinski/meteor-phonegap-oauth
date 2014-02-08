// Meteor's OAuth flow currently only works with popups. Phonegap does
// not handle this well. Using the InAppBrowser plugin we can load the
// OAuth popup into this child browser. Using the plugin by itself would
// not work with the MeteorRider phonegap method, this fixes it. This
// has not been tested on other Meteor phonegap methods. (tested on 3.3)
//
// http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html
// https://github.com/zeroasterisk/MeteorRider

/*global IAB:true, cordova */


// API for InAppBrowser
IAB = {
  closed: true, //for meteor to detect closed state

  open: function(url) {
    var self = this;

    cordova.exec(function(params) {
      if (params.type === 'loadstop') {
        console.debug('loadstart:', params.url);
        //check goal url agains params.url without anything after the path

        // uri contains an error param, manually close window
        if (params.url && params.url.match(/error/)) {
          self.close();
        }

        // uri contains client code, close so meteor can login
        if (params.url && params.url.match(/close&code/)) {
          self.close();
        }
      }

    // exec error
    }, function(err) {
      console.error('In App Browser error', err);
    }, "InAppBrowser", "open", [url, '_blank', 'location=no']);

    this.closed = false;
  },

  // close InAppBrowser
  close: function() {
    cordova.exec(function() {
    }, function(err) {
      console.error(err);
    }, "InAppBrowser", "close", []);

    this.closed = true;
  }
};


if (typeof device !== "undefined") { // if phonegap device
  
  window.open = function(url) {
    IAB.open(url);
    // return InAppBrowser so you can set foo = open(...) and then foo.close()
    return IAB;
  };

  window.closed = IAB.closed;
}

