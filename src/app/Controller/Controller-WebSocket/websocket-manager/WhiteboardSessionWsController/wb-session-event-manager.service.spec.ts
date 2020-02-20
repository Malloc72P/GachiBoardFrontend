import { TestBed } from '@angular/core/testing';

import { WbSessionEventManagerService } from './wb-session-event-manager.service';

describe('WbSessionEventManagerService', () => {
  let service: WbSessionEventManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WbSessionEventManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
