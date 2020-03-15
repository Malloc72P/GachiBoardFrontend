import { TestBed } from '@angular/core/testing';

import { VideoChatPanelManagerService } from './video-chat-panel-manager.service';

describe('VideoChatPanelManagerService', () => {
  let service: VideoChatPanelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoChatPanelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
