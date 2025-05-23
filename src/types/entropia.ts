// Types specific to Entropia application

import { BaseComponentProps, User } from './common'

// Exam types
export type ExamType = 'PSC' | 'ENEM' | 'SIS' | 'MACRO'

export interface Exam {
  id: string
  type: ExamType
  name: string
  year: number
  edition?: string
  applicationDate: Date
  resultDate?: Date
  status: 'upcoming' | 'ongoing' | 'completed'
}

// Course types
export interface Course {
  id: string
  name: string
  code: string
  university: string
  campus?: string
  type: 'bacharelado' | 'licenciatura' | 'tecnólogo'
  duration: number // in semesters
  shift: 'matutino' | 'vespertino' | 'noturno' | 'integral'
  modality: 'presencial' | 'ead' | 'híbrido'
  vacancies: number
  description?: string
}

// Grade calculation
export interface Grade {
  subject: string
  score: number
  weight: number
  maxScore: number
}

export interface GradeCalculation {
  exam: ExamType
  course: Course
  grades: Grade[]
  totalScore: number
  maxTotalScore: number
  percentage: number
  cutoffScore?: number
  approved?: boolean
  ranking?: number
}

// Student types
export interface Student extends User {
  role: 'student'
  studentId: string
  enrollmentDate: Date
  courses: StudentCourse[]
  grades: StudentGrade[]
  profile: StudentProfile
}

export interface StudentProfile {
  phone?: string
  dateOfBirth?: Date
  address?: Address
  emergencyContact?: Contact
  academicInfo: AcademicInfo
  quota?: QuotaType[]
}

export interface StudentCourse {
  courseId: string
  enrollmentDate: Date
  status: 'active' | 'completed' | 'dropped' | 'transferred'
  progress: number // 0-100
}

export interface StudentGrade {
  examId: string
  courseId: string
  subjects: Subject[]
  totalScore: number
  approved: boolean
  ranking?: number
  calculatedAt: Date
}

export interface Subject {
  name: string
  score: number
  weight: number
  maxScore: number
}

// Address and contact
export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Contact {
  name: string
  relationship: string
  phone: string
  email?: string
}

// Academic information
export interface AcademicInfo {
  highSchoolType: 'public' | 'private' | 'mixed'
  highSchoolCompletionYear: number
  hasCompletedHighSchool: boolean
  isCurrentlyStudying: boolean
  previousUniversityExperience?: boolean
  desiredCourses: string[]
  targetExams: ExamType[]
}

// Quota system
export type QuotaType = 
  | 'school_public' 
  | 'school_private'
  | 'income_low'
  | 'race_black'
  | 'race_brown'
  | 'race_indigenous'
  | 'disability'
  | 'rural_area'

export interface QuotaEligibility {
  type: QuotaType
  eligible: boolean
  documentation?: string[]
  verified?: boolean
}

// Calculator types
export interface CalculatorInput {
  exam: ExamType
  courseId?: string
  subjects: SubjectInput[]
  quotas: QuotaType[]
  year?: number
}

export interface SubjectInput {
  name: string
  score: number
  weight?: number
}

export interface CalculatorResult {
  input: CalculatorInput
  calculation: GradeCalculation
  recommendations: Recommendation[]
  alternativeCourses: Course[]
  studyPlan?: StudyPlan
}

export interface Recommendation {
  type: 'improve_subject' | 'try_quota' | 'consider_course' | 'study_more'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionItems: string[]
}

// Study plan
export interface StudyPlan {
  id: string
  studentId: string
  targetExam: ExamType
  targetCourse: Course
  createdAt: Date
  updatedAt: Date
  subjects: StudySubject[]
  timeline: StudyTimeline[]
  goals: StudyGoal[]
}

export interface StudySubject {
  name: string
  currentLevel: number // 0-100
  targetLevel: number // 0-100
  priority: 'high' | 'medium' | 'low'
  estimatedHours: number
  resources: StudyResource[]
}

export interface StudyResource {
  type: 'video' | 'pdf' | 'quiz' | 'exercise' | 'book'
  title: string
  url?: string
  duration?: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  completed: boolean
}

export interface StudyTimeline {
  week: number
  subjects: string[]
  hours: number
  milestones: string[]
}

export interface StudyGoal {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  completedAt?: Date
}

// Materials and content
export interface Material {
  id: string
  title: string
  description: string
  type: 'pdf' | 'video' | 'quiz' | 'exercise' | 'article'
  subject: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  tags: string[]
  url?: string
  downloadUrl?: string
  thumbnail?: string
  duration?: number
  size?: number
  createdAt: Date
  updatedAt: Date
  author: string
  downloads: number
  rating: number
  reviews: MaterialReview[]
}

export interface MaterialReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
  helpful: number
}

// Statistics
export interface StudentStats {
  totalStudyHours: number
  completedMaterials: number
  averageScore: number
  strongSubjects: string[]
  weakSubjects: string[]
  progress: SubjectProgress[]
  recentActivity: Activity[]
}

export interface SubjectProgress {
  subject: string
  progress: number // 0-100
  trend: 'up' | 'down' | 'stable'
  lastActivity: Date
}

export interface Activity {
  id: string
  type: 'study' | 'quiz' | 'material' | 'exam'
  title: string
  subject?: string
  duration?: number
  score?: number
  createdAt: Date
}

// Component props for Entropia-specific components
export interface HeroSectionProps extends BaseComponentProps {
  showVideo?: boolean
  showStats?: boolean
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
}

export interface CalculatorProps extends BaseComponentProps {
  defaultExam?: ExamType
  onCalculate?: (result: CalculatorResult) => void
  showRecommendations?: boolean
}

export interface StatsCardProps extends BaseComponentProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ComponentType<any>
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

export default {
  ExamType,
  Exam,
  Course,
  Grade,
  GradeCalculation,
  Student,
  StudentProfile,
  StudentCourse,
  StudentGrade,
  Subject,
  Address,
  Contact,
  AcademicInfo,
  QuotaType,
  QuotaEligibility,
  CalculatorInput,
  SubjectInput,
  CalculatorResult,
  Recommendation,
  StudyPlan,
  StudySubject,
  StudyResource,
  StudyTimeline,
  StudyGoal,
  Material,
  MaterialReview,
  StudentStats,
  SubjectProgress,
  Activity,
  HeroSectionProps,
  CalculatorProps,
  StatsCardProps
}