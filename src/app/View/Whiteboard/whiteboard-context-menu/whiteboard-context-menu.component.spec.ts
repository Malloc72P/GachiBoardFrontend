import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardContextMenuComponent } from './whiteboard-context-menu.component';

describe('WhiteboardContextMenuComponent', () => {
  let component: WhiteboardContextMenuComponent;
  let fixture: ComponentFixture<WhiteboardContextMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardContextMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
