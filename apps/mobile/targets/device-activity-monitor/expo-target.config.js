module.exports = (config) => ({
  type: 'device-activity-monitor',
  name: 'BlockAppsActivityMonitor',
  bundleIdentifier: '.monitor',
  deploymentTarget: '16.0',
  frameworks: ['DeviceActivity', 'ManagedSettings', 'FamilyControls'],
  entitlements: {
    'com.apple.developer.family-controls': true,
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
})
