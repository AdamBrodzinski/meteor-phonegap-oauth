meteor-phonegap-oauth
=====================


Meteor's OAuth flow currently only works with popups. PhoneGap does
not handle this very well. Using the InAppBrowser plugin we can load the
OAuth popup into this child browser.

The patch basically listens for the pagestop event and analyzes the uri to determine what action to take (if any). This includes manually closing the InAppBrowser to satisfy Meteor's checks.

This has been tested with Meteor 0.8.2, accounts-linkedin, Cordova 3.5 and the Meteor-Rider hijacking method.  

 ***note you need to use at least Cordova 3.5 and Meteor 0.8.2***


### Setup

- [Install PhoneGap](http://docs.phonegap.com/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface) (i'm using the cordova npm commmand line).
- [Install InAppBrowser](https://github.com/apache/cordova-plugin-inappbrowser/blob/master/doc/index.md) plugin into your phonegap app
- [Install Device](https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md) plugin into your phonegap app (used to detect Android)

- Configure Meteor with PhoneGap, use [this boilerplate](https://github.com/AdamBrodzinski/meteor-mobile-boilerplate) if you want to get started quickly
- [Install Metorite](https://npmjs.org/package/meteorite) if needed

### Installation

- Add OAuth Meteor package of your choice (i'm using LinkedIn)
- `mrt add phonegap-oauth`
- Click the log in with [Twitter/LinkedIn/etc...]
- Enter email/password and click authorize
- Meteor should now be logged in

See [this repo](https://github.com/AdamBrodzinski/meteor-oauth-demo) for a working example

Special thanks to [Zoltan](https://github.com/zol) for the inspiration on this from Meteor-Talk!

### Contributors  

- [faceyspacey](https://github.com/faceyspacey)
- [jperl](https://github.com/jperl)
