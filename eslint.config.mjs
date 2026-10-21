// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['content/**', 'changelog.config.js'],
}, {
  rules: {
    // /archives/ 由 [...params].vue 處理，規則認不出可選的 catch-all
    'link-checker/valid-route': 'off',
  },
})
