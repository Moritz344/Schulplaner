export interface HomeworkEntry {
  id: number,
  name: string,
  fk_subject: number,
  due_date: number,
  subjectData?: any,
  isToday?: boolean,
  completed: boolean
}

export interface SubjectExtraDataEntry {
  fk_subject: number,
  grades: number,
  exams: number,
  homework: number,
  averageGrade?: number
}

export interface TimetableConfig {
  id: number,
  hour_length: number | null,
  start_time: string | null,
  end_time: string | null,
  break_time: number | null,
  break_step: number | null
}

export interface TimetableSlot {
  period: number,
  fk_subject: number | null,
  room: string
}

export interface TimetableDay {
  day: number,
  name: string,
  slots: TimetableSlot[]
}

export interface TimetableEntry {
  day: number,
  fk_subject: number | null,
  start_time: string,
  end_time: string,
  room: string | null
}

export interface SubjectEntry {
  id: number,
  color: string,
  name: string
}

export interface GradeEntry {
  id: number,
  fk_subject: number,
  grade: number
}

export interface ExamEntry {
  id: number,
  fk_subject: number,
  description: string,
  daysLeft?: number,
  subjectData?: any,
  date: number | null
}
