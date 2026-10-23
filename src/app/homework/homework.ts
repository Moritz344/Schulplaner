import { Component,signal,inject,OnInit,computed } from '@angular/core';
import { Electron } from '../electron';
import { Settings } from '../settings';
import { DatePipe } from '@angular/common';
import { Dialog } from '../dialog/dialog';
import { FormsModule } from '@angular/forms';
import { HomeworkEntry } from '../types';
import { DialogService } from '../dialog/dialog-service';

interface SearchParams {
  text: string,
  status: 1 | 0 | -1,
  fk_subject: number
}

@Component({
  selector: 'app-homework',
  imports: [DatePipe,FormsModule,Dialog],
  templateUrl: './homework.html',
  styleUrl: './homework.css',
})
export class Homework implements OnInit {
  public electron = inject(Electron);
  public settings = inject(Settings);
  public dialog = inject(DialogService);
  public today = new Date()
  public days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  public searchParams = signal<SearchParams>({
    text: "",
    status: -1,
    fk_subject: 0
  });
  public homeworkData = computed<HomeworkEntry[]>(() => {
    const { text, status,fk_subject } = this.searchParams();

    const search = text.toLowerCase();

    return this.settings.homeworkData().filter((x: HomeworkEntry) => {
      const matchesText = search.length == 0 || x.name?.toLowerCase().includes(search);
      const matchesStatus = status == -1 || +x.completed == status;
      const matchesSubject = fk_subject == 0 || fk_subject == x.subjectData.id;
      return matchesText && matchesStatus && matchesSubject;
    });
  });

  updateSearchParams(patch: Partial<SearchParams>) {
    this.searchParams.update(params => ({ ...params, ...patch }));
  }


  constructor() {
  }

  ngOnInit(): void {
  }

  onDeleteHomework(homework: HomeworkEntry) {
    this.dialog.open("Hausaufgabe löschen","delete-homework")
    this.dialog.homeworkDeleteData.set(homework)
  }

  onAddHomework() {
    this.dialog.open("Neue Hausaufgabe","new-homework")
  }

  getDayNameFromId(id: number) {
    return this.days[id]
  }

  updateCompletedStatus(homework: HomeworkEntry) {
    this.electron.updateHomework({
      id: homework.id,
      completed: homework.completed
    })
  }

}
