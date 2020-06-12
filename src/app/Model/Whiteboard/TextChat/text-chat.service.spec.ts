import { TestBed } from '@angular/core/testing';

import { TextChatService } from './text-chat.service';

describe('TextChatService', () => {
  let service: TextChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
