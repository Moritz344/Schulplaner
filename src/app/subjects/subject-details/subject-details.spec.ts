import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectView } from './subject-view';

describe('SubjectView', () => {
  let component: SubjectView;
  let fixture: ComponentFixture<SubjectView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
