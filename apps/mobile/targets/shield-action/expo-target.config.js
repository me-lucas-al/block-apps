/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'shield-action',
  name: 'BlockAppsShieldAction',
  bundleIdentifier: '.shieldaction',
  deploymentTarget: '16.0',
  frameworks: ['ManagedSettings', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
})
