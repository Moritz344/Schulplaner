import { Component,inject,signal,computed } from '@angular/core';
import { Electron } from '../electron';
import { Settings } from '../settings';
import { DatePipe } from '@angular/common';
import { DialogService } from '../dialog/dialog-service';
import { FormsModule } from '@angular/forms';
import { ExamEntry } from '../types';

interface SearchParams {
  text: string,
  status: number,
  fk_subject: number
}

@Component({
  selector: 'app-exams',
  imports: [DatePipe,FormsModule],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})


export class Exams {
  public electron = inject(Electron);
  public settings = inject(Settings);
  public dialog = inject(DialogService)

  public searchParams = signal<SearchParams>({
    text: "",
    status: 0,
    fk_subject: 0
  });
  public examsData = computed<ExamEntry[]>(() => {
    const { text, status,fk_subject } = this.searchParams();

    const search = text.toLowerCase();

    return this.settings.examsData().filter((x: ExamEntry) => {
      const matchesText = search.length == 0 || x.description?.toLowerCase().includes(search);
      const matchesStatus = status == 0 || (status == 1 && x.daysLeft! < 0) || (status == 2 && x.daysLeft! >= 0);
      const matchesSubject = fk_subject == 0 || x.fk_subject === fk_subject;
      return matchesText && matchesStatus && matchesSubject;
    });
  });

  updateSearchParams(patch: Partial<SearchParams>) {
    this.searchParams.update(params => ({ ...params, ...patch }));
  }

  constructor() {
    this.settings.initExamsData();
  }


  onNewExam() {
    this.dialog.open("Neue Prüfung","new-exam")
    this.dialog.show.set(true);
  }



}
