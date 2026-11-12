export type AppCategory = 'social' | 'video' | 'messaging' | 'music' | 'dating' | 'games'

export type KnownApp = {
  readonly packageName: string
  readonly label: string
}

export type AppSuggestion = KnownApp & {
  readonly category: AppCategory
  readonly aliases?: readonly string[]
}
