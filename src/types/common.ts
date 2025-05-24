// Common types used throughout the application

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type Variant = 'default' | 'outline' | 'ghost' | 'filled'

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
  data?: any
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: number
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Form types
export interface FormField {
  name: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  required?: boolean
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern'
  value?: any
  message: string
}

export interface FormError {
  field: string
  message: string
}

// Event types
export interface CustomEvent<T = any> {
  type: string
  data?: T
  timestamp: Date
}

// Component base props
export interface BaseComponentProps {
  className?: string
  id?: string
  testId?: string
}

// Theme types
export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  background: string
  surface: string
  text: string
}

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<any>
  badge?: string | number
  children?: NavItem[]
  external?: boolean
}

// Media types
export interface MediaItem {
  id: string
  type: 'image' | 'video' | 'audio'
  url: string
  alt?: string
  caption?: string
  thumbnail?: string
  duration?: number
  size?: number
}

// User types (basic)
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'pt' | 'en'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  path?: string
}

// Analytics events
export interface AnalyticsEvent {
  event: string
  category: string
  label?: string
  value?: number
  customData?: Record<string, any>
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error'
export type AsyncStatus = 'pending' | 'fulfilled' | 'rejected'

// Local storage types
export interface StorageItem<T> {
  value: T
  timestamp: number
  expiresAt?: number
}

// Feature flags
export interface FeatureFlags {
  darkMode: boolean
  newCalculator: boolean
  advancedStats: boolean
  betaFeatures: boolean
}

// Export default removed to avoid TypeScript compilation issues