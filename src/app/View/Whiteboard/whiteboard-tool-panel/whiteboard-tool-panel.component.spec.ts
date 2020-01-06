import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardToolPanelComponent } from './whiteboard-tool-panel.component';

describe('WhiteboardToolPanelComponent', () => {
  let component: WhiteboardToolPanelComponent;
  let fixture: ComponentFixture<WhiteboardToolPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardToolPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardToolPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
