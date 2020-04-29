import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTimerComponent } from './time-timer.component';

describe('TimeTimerComponent', () => {
  let component: TimeTimerComponent;
  let fixture: ComponentFixture<TimeTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
