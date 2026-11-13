/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'shield-config',
  name: 'BlockAppsShieldConfig',
  bundleIdentifier: '.shieldconfig',
  deploymentTarget: '16.0',
  frameworks: ['ManagedSettings', 'ManagedSettingsUI', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
})
