import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardMinimapComponent } from './whiteboard-minimap.component';

describe('WhiteboardMinimapComponent', () => {
  let component: WhiteboardMinimapComponent;
  let fixture: ComponentFixture<WhiteboardMinimapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardMinimapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardMinimapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
