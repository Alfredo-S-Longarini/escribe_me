export type TemplateKey =
  | 'diary'
  | 'novel'
  | 'story'
  | 'poetry'
  | 'letter'
  | 'free'
  | 'essay'

export type BookStatus = 'draft' | 'in_progress' | 'finished'

export interface Book {
  id: string
  user_id: string
  title: string
  template: TemplateKey
  status: BookStatus
  cover_url: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: string
  book_id: string
  title: string
  content: string
  order: number
  created_at: string
  updated_at: string
}

export interface ShareLink {
  id: string
  book_id: string
  token: string
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  preferences: UserPreferences
  created_at: string
}

export interface UserPreferences {
  particles: boolean
  particleMode: 'fireflies' | 'cosmos'
  theme: 'dark'
}
