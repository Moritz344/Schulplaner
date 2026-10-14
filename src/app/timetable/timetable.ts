import { Component,computed,signal,inject } from '@angular/core';
import { Electron } from '../electron';
import { Settings } from '../settings';
import { TimetableEntry } from '../types';
import { buildSchedule, ScheduleSlot } from './schedule';
import { TimetableSetup } from './timetable-setup/timetable-setup';
import { DialogService } from '../dialog/dialog-service';

// TODO: show homework and exams

interface WeekDay {
  name: string,
  date: string
}

@Component({
  selector: 'app-timetable',
  imports: [TimetableSetup],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css',
})
export class Timetable {
  public electron = inject(Electron);
  public settings = inject(Settings);
  public dialog = inject(DialogService);

  public days = signal<WeekDay[]>([]);
  public startSetup = signal<boolean>(false);

  public readonly schedule = computed<ScheduleSlot[]>(() => {
    const fromConfig = buildSchedule(this.settings.timetableConfig());
    if (fromConfig.length > 0) { return fromConfig; }
    return this.buildScheduleFromData();
  });



  constructor() {
    this.initWeekDays();
    this.settings.initTimetableConfig();
    this.settings.initTimetableData().then(() => console.log(this.settings.timetableData()));
  }


  getLesson(day: number, start: string): TimetableEntry | undefined {
    return this.settings.timetableData().find(e => e.day === day && e.start_time === start);
  }


  subjectFor(entry: TimetableEntry | undefined) {
    if (!entry || entry.fk_subject == null) { return undefined; }
    return this.settings.getSubjectDataFromId(entry.fk_subject);
  }

  private buildScheduleFromData(): ScheduleSlot[] {
    const seen = new Map<string, ScheduleSlot>();
    for (const entry of this.settings.timetableData()) {
      if (!seen.has(entry.start_time)) {
        seen.set(entry.start_time, { period: 0, start: entry.start_time, end: entry.end_time });
      }
    }
    return [...seen.values()]
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((slot, index) => ({ ...slot, period: index + 1 }));
  }

  initWeekDays() {
    const today = new Date();
    const currentDayOfTheWeek = today.getDay();

    let diffToMonday = currentDayOfTheWeek;
    if (currentDayOfTheWeek == 0) {
      diffToMonday -= 6;
    } else {
      diffToMonday = diffToMonday - 1;
    }

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday)
    monday.setHours(0,0,0,0);

    const weeks: WeekDay[] = [];

    for (let i=0;i<5;i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i)

      weeks.push({
        name: currentDate.toLocaleDateString('de-DE', { weekday: 'short' }),
         date: currentDate.toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
        }),
      })

      
    }

    this.days.set(weeks);
  }

}
