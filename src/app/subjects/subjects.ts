import { Component,inject,signal,OnInit } from '@angular/core';
import { Settings } from '../settings';
import { SubjectEntry } from '../types';


@Component({
  selector: 'app-subjects',
  imports: [],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects implements OnInit {
  public settings = inject(Settings);

  constructor() {
    this.settings.initSubjectsData();
  }

  ngOnInit(): void {
  }

  onViewSubjectDetails(subject: SubjectEntry | null) {
    this.settings.selectedSubject.set(subject);
    this.settings.view.set("subject-details")
  }




}
