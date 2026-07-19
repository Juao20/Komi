export interface HealthScoreBreakdownItem {
  label: string
  points: number
  max: number
}

export interface HealthScore {
  score: number
  level: 'excellent' | 'good' | 'needs_attention'
  breakdown: HealthScoreBreakdownItem[]
  explanation?: string
}

export interface DailyTip {
  icon: string
  message: string
}

export interface DailyBriefing {
  date: string
  health_score: number
  narrative: string
  tips: DailyTip[]
  created_at: string
}

export interface AIMessage {
  public_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
