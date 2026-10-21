// 類型清單與 changelog.config.js 一致
const BANNED_WORDS = /\b(claude|anthropic|ai|llm|gpt|copilot|agent)\b|agents\.md|claude\.md|自動生成|由模型產生|co-authored-by|generated with/i

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'no-banned-words': ({ raw }) => {
          const hit = raw?.match(BANNED_WORDS)
          return [!hit, `commit 訊息不可出現「${hit?.[0]}」`]
        },
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', ['test', 'feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'ci', 'perf']],
    // 主旨可以用中文，也允許 emoji 開頭
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'no-banned-words': [2, 'always'],
  },
}
