import { Component,inject, signal,OnInit, HostListener } from '@angular/core';
import { Electron } from '../electron';
import { Settings } from '../settings';
import { FormsModule } from '@angular/forms';
import { DialogService } from './dialog-service';
import { Datepicker } from '../datepicker/datepicker';
import { HomeworkEntry,ExamEntry,GradeEntry, TimetableConfig } from '../types';

@Component({
  selector: 'app-dialog',
  imports: [FormsModule, Datepicker],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class Dialog implements OnInit {
  public electron = inject(Electron);
  public settings = inject(Settings);
  public dialogService = inject(DialogService);
  public maxAmountOfCharacters = signal<number>(50);

  public newHomeworkData = signal<HomeworkEntry>({
    id: -1,
    name: "",
    due_date: 0,
    completed: false,
    fk_subject: 1
  })

  public newExamData = signal<ExamEntry>({
    id: -1,
    description: "",
    date: 0,
    fk_subject: 1
  })

  public grades = signal<number[]>([1,2,3,4,5,6])

  public newGradeData = signal<GradeEntry>({
    id: -1,
    fk_subject: 0,
    grade: 0
  })

  public newTimetableConfig = signal<TimetableConfig>({
    id: 0,
    hour_length: null,
    start_time: null,
    end_time: null,
    break_time: null,
    break_step: null
  })


  constructor() {
  }

  ngOnInit() {
  }

  @HostListener("window:keydown",['$event'])
  closeOnEscape(event: any) {
    if (event.code == "Escape") {
      this.dialogService.close();
    }
  }

  onResetGrades() {
    this.electron.resetGrades();
    this.settings.initGradesData();
    this.settings.averageGrade.set(0);
    this.dialogService.close();
  }

  onDeleteGrade() {
    this.electron.deleteGrade(this.dialogService.gradeDataToEdit().id);
    this.settings.initGradesData();
    this.dialogService.close();
  }

  onSaveNewSubject() {

  }

  onUpdateGrade() {
    this.electron.updateGrade(this.dialogService.gradeDataToEdit());
    this.settings.initGradesData();
    this.dialogService.close();
    
  }

  onUpdateGradeNumber(grade: number) {
    this.dialogService.gradeDataToEdit.update((data: any) => ({...data,grade}));
  }

  onSelectGrade(grade: number) {
    this.newGradeData.update(data => ({ ...data, grade }));
  }

  async onAddHomework() {
    await this.electron.updateHomework(this.newHomeworkData());
    this.settings.initHomeworkData();
    this.dialogService.close();
  }

  async onAddGrade() {
    await this.electron.updateGrade(this.newGradeData());
    this.settings.initGradesData();
    this.dialogService.close();
  }

  async onAddExam() {
    await this.electron.newExam(this.newExamData());
    await this.settings.initExamsData();
    this.dialogService.close();
  }

  async onDeleteHomework() {
    this.electron.deleteHomework(this.dialogService.homeworkDeleteData().id)
    this.settings.initHomeworkData();
    this.dialogService.close();

  }


}
