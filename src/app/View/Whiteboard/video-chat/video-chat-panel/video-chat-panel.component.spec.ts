import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoChatPanelComponent } from './video-chat-panel.component';

describe('VideoChatPanelComponent', () => {
  let component: VideoChatPanelComponent;
  let fixture: ComponentFixture<VideoChatPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoChatPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoChatPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
