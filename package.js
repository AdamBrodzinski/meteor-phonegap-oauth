Package.describe({
  summary: 'A fix for Meteor OAuth with Phonegap'
});

Package.on_use(function (api) {
  api.use(['logging', 'oauth'], 'server');

  api.add_files('patch_window.js', 'client');
  api.add_files('patch_login_response.js', 'server');
});
