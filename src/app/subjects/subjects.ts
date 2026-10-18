import { Component,inject,signal } from '@angular/core';
import { Settings } from '../settings';

// TODO: subject-details page

interface SubjectInfo {
  fk_subject: number,
  grades: number,
  exams: number,
  homework: number
}

@Component({
  selector: 'app-subjects',
  imports: [],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects {
  public settings = inject(Settings);

  public subjectInfo = signal<SubjectInfo[]>([])

  constructor() {
    this.initSubjectExtraData();
  }

  getInfoAmountFromSubjectId(list: any,id: number) {
    const entry = list.filter((x: any) => x.fk_subject == id);
    return Number(entry.length);
  }


  initSubjectExtraData() {
    const data = [];
    for (const subject of this.settings.subjectData()) {
      const grades = this.getInfoAmountFromSubjectId(this.settings.gradesData(),subject.id);
      const exams = this.getInfoAmountFromSubjectId(this.settings.examsData(),subject.id);
      const homework = this.getInfoAmountFromSubjectId(this.settings.homeworkData(),subject.id);
      const info = {
        fk_subject: subject.id,
        grades,
        exams,
        homework
      }
      data.push(info);
    }
    this.subjectInfo.set(data);
    console.log(this.subjectInfo());
  }

}
