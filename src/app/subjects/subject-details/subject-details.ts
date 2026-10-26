import { Component,inject,signal } from '@angular/core';
import { Settings } from '../../settings';
import { ExamEntry, SubjectExtraDataEntry } from '../../types';

@Component({
  selector: 'app-subject-details',
  imports: [],
  templateUrl: './subject-details.html',
  styleUrl: './subject-details.css',
})
export class SubjectDetails {
  public settings = inject(Settings)
  public extraSubjectData = signal<SubjectExtraDataEntry>({
    fk_subject: 0,
    exams: 0,
    grades: 0,
    homework: 0,
    averageGrade: 0
  });
  public closestExam = signal<string>("");
  public grades = signal<number[]>([]);

  constructor() {
    this.setExtraSubjectData();
    this.setClosestExamData();
    this.setGrades();
  }

  setGrades() {
    this.grades.set(this.settings.gradesData().filter(x => x.fk_subject == this.extraSubjectData().fk_subject).map(x => x.grade))
    console.log(this.grades());
  }

  setClosestExamData() {
    const closestExam = this.settings.getClosestExamForSubject(this.extraSubjectData().fk_subject);
    if (!closestExam || !closestExam?.date) {
      return;
    }
    const date = new Date(closestExam.date);
    const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
    const month = date.getMonth() + 1;
    const day = date.getDate();
    this.closestExam.set(dayName + ", " + day + "." + month)
  }

  setExtraSubjectData() {
    const extraData = this.settings.subjectExtraData().find((subject: SubjectExtraDataEntry) => subject.fk_subject == this.settings.selectedSubject()?.id);
    if (!extraData) { return; }
    this.extraSubjectData.set(extraData)
    console.log(this.extraSubjectData())
  }

  onBack() {
    this.settings.selectedSubject.set(null);
    this.settings.view.set("subjects");
  }


}
