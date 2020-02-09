import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardCardComponent } from './whiteboard-card.component';

describe('WhiteboardCardComponent', () => {
  let component: WhiteboardCardComponent;
  let fixture: ComponentFixture<WhiteboardCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
