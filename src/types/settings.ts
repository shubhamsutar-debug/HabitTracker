export type Theme = 'light' | 'dark' | 'system'
export type WeekStartDay = 0 | 1 // 0 = Sunday, 1 = Monday

export interface Settings {
  id: 'settings' // singleton
  theme: Theme
  weekStartsOn: WeekStartDay
  notificationsEnabled: boolean
  onboardingCompleted: boolean
}
