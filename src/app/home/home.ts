import { Component,inject,signal } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { Leftbar } from '../leftbar/leftbar';
import { Settings } from '../settings';
import { Grades } from '../grades/grades';
import { Timetable } from '../timetable/timetable';
import { Exams } from '../exams/exams';
import { Dialog } from '../dialog/dialog';
import { AboutDialog } from '../about-dialog/about-dialog';
import { DialogService } from '../dialog/dialog-service';
import { Homework } from '../homework/homework';
import { Subjects } from '../subjects/subjects';
import { Dashboard } from '../dashboard/dashboard';
import { SubjectDetails } from '../subjects/subject-details/subject-details';

// TODO: implement dashboard 

@Component({
  selector: 'app-home',
  imports: [Topbar,Leftbar,Grades,Timetable,Exams,Dialog,AboutDialog,Subjects,Homework,Dashboard,SubjectDetails],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  public settings = inject(Settings);
  public dialog = inject(DialogService);

}
