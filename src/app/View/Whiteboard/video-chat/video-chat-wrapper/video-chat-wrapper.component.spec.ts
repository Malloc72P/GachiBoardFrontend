import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoChatWrapperComponent } from './video-chat-wrapper.component';

describe('VideoChatWrapperComponent', () => {
  let component: VideoChatWrapperComponent;
  let fixture: ComponentFixture<VideoChatWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoChatWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoChatWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
