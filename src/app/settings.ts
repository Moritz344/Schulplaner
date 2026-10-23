import { Injectable,signal,inject } from '@angular/core';
import { HomeworkEntry,ExamEntry,TimetableConfig,TimetableEntry,GradeEntry, SubjectEntry,SubjectExtraDataEntry } from './types';
import { Electron } from './electron';

type Tab = "timetable" | "grades" | "home" | "exams" | "homework" | "subjects" | "subject-details";

@Injectable({
  providedIn: 'root',
})
export class Settings {
  public electron = inject(Electron);
  public view = signal<Tab>("subjects");
  public showAbout = signal<boolean>(false);

  public homeworkData = signal<HomeworkEntry[]>([]);
  public examsData = signal<ExamEntry[]>([]);
  public gradesData = signal<any[]>([]);
  public averageGrade = signal<number>(0);
  public subjectData = signal<any[]>([]);
  public timetableData = signal<TimetableEntry[]>([]);
  public subjectExtraData = signal<SubjectExtraDataEntry[]>([])

  public selectedSubject = signal<SubjectEntry | null>(null);

  public timetableConfig = signal<TimetableConfig>({
    id: 0,
    hour_length: 0,
    start_time: "",
    end_time: "",
    break_step: 0,
    break_time: 0
  });

  constructor() {
    this.initGradesData().then(() => {
      this.initExamsData();
      this.initHomeworkData();
    });
  }

  async initHomeworkData() {
    this.homeworkData.set(await this.electron.getHomework());
      this.homeworkData.update(list =>
        list.map(item => ({
            ...item,
            subjectData: this.getSubjectDataFromId(item.fk_subject),
            isToday: this.checkIfDueDateIsToday(item.due_date)
        }))
    )
    this.sortHomeworkDataByClosestDate();
  }

  checkIfDueDateIsToday(due_date: number) {
     const date = new Date(due_date)
     date.setHours(0,0,0,0);
     const dueStart = date.getTime();
     const todayStart = new Date();
     todayStart.setHours(0, 0, 0, 0);
     return dueStart === todayStart.getTime();
  }

  async initGradesData() {
    this.gradesData.set(await this.electron.getGrades());
    this.calculateAverageGradeOfAll();
  }

  calculateAverageGradeOfAll() {
    if (this.gradesData().length == 0 ) {
      return;
    }
    const sumOfAllGrades = this.gradesData().reduce((acc,currentValue) => acc + currentValue.grade,0)
    const gradesQuantity = this.gradesData().length;
    const averageGradeNotRounded = (sumOfAllGrades / gradesQuantity).toFixed(2);
    this.averageGrade.set(Number(averageGradeNotRounded))
  }

  getAverageGradeForSubject(id: number | undefined) {
    if (!id) {
      return 0;
    }

    const allGradesEntries = this.gradesData().filter((grade: GradeEntry) => grade.fk_subject == id)
    if (allGradesEntries.length == 0) {
      return 0;
    }

    const sumOfAllGrades = allGradesEntries.reduce((acc,currentValue) => acc + currentValue.grade,0);
    const gradesQuantity = allGradesEntries.length;
    return (sumOfAllGrades / gradesQuantity).toFixed(2);
  }

  async initSubjectsData() {
    this.subjectData.set(await this.electron.getSubjects());
    this.initSubjectExtraData();
  }

  private getInfoAmountFromSubjectId(list: any,id: number) {
    const entry = list.filter((x: any) => x.fk_subject == id);
    return Number(entry.length);
  }

  initSubjectExtraData() {
    const data = [];
    for (const subject of this.subjectData()) {
      const grades = this.getInfoAmountFromSubjectId(this.gradesData(),subject.id);
      const exams = this.getInfoAmountFromSubjectId(this.examsData(),subject.id);
      const homework = this.getInfoAmountFromSubjectId(this.homeworkData(),subject.id);
      const averageGrade = this.getAverageGradeForSubject(subject?.id);
      const info = {
        fk_subject: subject.id,
        grades,
        exams,
        homework,
        averageGrade: Number(averageGrade)
      }
      data.push(info);
    }
    this.subjectExtraData.set(data);
  }

  getSubjectDataFromId(id: number) {
    return this.subjectData().find(s => s.id == id);
  }

  getGradeColor(grade: number) {
    if (grade <= 6 && grade > 4) {
      return "red";
    } else if (grade <= 4 && grade >= 3) {
      return "orange";
    } else if (grade < 3 && grade > 0) {
      return "green"
    } else {
      return "red"
    }
  }

  async initTimetableConfig() {
    const config: any = await this.electron.getTimetableConfig();
    this.timetableConfig.set(config[0]);
  }

  async initTimetableData() {
    this.timetableData.set(await this.electron.getTimetable());
  }

  async saveTimetable(entries: TimetableEntry[]) {
    await this.electron.saveTimetable(entries);
    await this.initTimetableData();
  }


  async initExamsData() {
    this.examsData.set(await this.electron.getExam());
    this.examsData.update(exam => 
      exam.map(item => ({
        ...item,
        daysLeft: Math.ceil((Number(item.date) - Date.now()) / 86400000) || 0,
        subjectData: this.getSubjectDataFromId(item.fk_subject)
      }))
    )
    this.sortExamEntriesByClosestDate();
  }

  sortHomeworkDataByClosestDate() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayUnixtimestamp = startOfToday.getTime();
    this.homeworkData.update(list =>
      [...list].sort((a: HomeworkEntry, b: HomeworkEntry) => {
        const an = Number(a.due_date) - todayUnixtimestamp;
        const bn = Number(b.due_date) - todayUnixtimestamp;
        if ((an >= 0) !== (bn >= 0)) return an >= 0 ? -1 : 1;
        return an - bn;
      })
    );

  }


  sortExamEntriesByClosestDate() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const today = startOfToday.getTime();
    this.examsData.update(list =>
      [...list].sort((a: ExamEntry, b: ExamEntry) => {
        const an = Math.floor((Number(a.date) - today) / 86400000);
        const bn = Math.floor((Number(b.date) - today) / 86400000);
        if ((an >= 0) !== (bn >= 0)) return an >= 0 ? -1 : 1;
        return an - bn;
      })
    );
  }

}
