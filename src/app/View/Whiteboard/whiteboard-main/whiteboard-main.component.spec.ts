import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardMainComponent } from './whiteboard-main.component';

describe('WhiteboardMainComponent', () => {
  let component: WhiteboardMainComponent;
  let fixture: ComponentFixture<WhiteboardMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
