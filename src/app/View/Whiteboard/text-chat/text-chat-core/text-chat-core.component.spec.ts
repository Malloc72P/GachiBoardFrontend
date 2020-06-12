import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextChatCoreComponent } from './text-chat-core.component';

describe('TextChatCoreComponent', () => {
  let component: TextChatCoreComponent;
  let fixture: ComponentFixture<TextChatCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextChatCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextChatCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
