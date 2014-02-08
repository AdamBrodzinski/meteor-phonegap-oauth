Package.describe({
  summary: 'A fix for Meteor OAuth with Phonegap'
});

Package.on_use(function (api) {
  api.add_files(["oauth_patch.js"], "client");
});

