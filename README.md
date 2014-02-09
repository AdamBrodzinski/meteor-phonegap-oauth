meteor-phonegap-oauth
=====================


Meteor's OAuth flow currently only works with popups. PhoneGap does
not handle this very well. Using the InAppBrowser plugin we can load the
OAuth popup into this child browser.

The patch basically listens for the pagestop event and analyzes the uri to determine what action to take (if any). This includes manually closing the InAppBrowser to satisfy Meteor's checks.

This has been tested with Meteor 0.7, Cordova 3.3 and the Meteor-Rider hijacking method.  
You can view demo of this working by searching for blonk on the App Store or Google Play Store.



### Setup

- [Install PhoneGap](http://docs.phonegap.com/en/3.3.0/guide_cli_index.md.html#The%20Command-Line%20Interface) (i'm using the cordova npm commmand line).
- [Install InAppBrowser](http://docs.phonegap.com/en/3.3.0/cordova_inappbrowser_inappbrowser.md.html#InAppBrowser) into your phonegap app
- Configure Meteor with PhoneGap (I'm using [Meteor-Rider](https://github.com/zeroasterisk/MeteorRider))... boilerplate based off of [blonk](http://blonk.co) coming in a few weeks
- [Install Metorite](https://npmjs.org/package/meteorite) if needed

### Installation

- Add OAuth Meteor package of your choice (i'm using LinkedIn)
- `mrt add phonegap-oauth`
- Click the log in with [FaceBook/LinkedIn/etc...]
- Enter email/password and click authorize
- Meteor should now be logged in


Special thanks to [Zoltan](https://github.com/zol) for the inspiration on this from Meteor-Talk!
