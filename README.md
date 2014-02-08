meteor-phonegap-oauth
=====================


Meteor's OAuth flow currently only works with popups. PhoneGap does
not handle this very well. Using the InAppBrowser plugin we can load the
OAuth popup into this child browser.

The patch basically listens for the pagestop event and analyzes the uri to determine what action to take (if any). This includes manually closing the InAppBrowser to satisfy Meteor's checks.

This has been tested with Meteor 0.7, Cordova 3.3 and the Meteor-Rider hijacking method.  
You can view the OAuth working by searching for blonk on the App Store or Google Play Store.

https://atmosphere.meteor.com/package/phonegap-oauth


### Setup

- [Install PhoneGap](http://docs.phonegap.com/en/3.3.0/guide_cli_index.md.html#The%20Command-Line%20Interface) (i'm using the cordova npm commmand line).
- [Install InAppBrowser](http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html#InAppBrowser) into your phonegap app
- Configure Meteor with PhoneGap (I'm using [Meteor-Rider](https://github.com/zeroasterisk/MeteorRider))... boilerplate based off of [blonk](http://blonk.co) coming in a few weeks


### Installation

- Add OAuth package (i'm using LinkedIn)  
- `mrt install phonegap-oauth`


