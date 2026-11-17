module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    appleTeamId: process.env.APPLE_TEAM_ID,
  },
})
