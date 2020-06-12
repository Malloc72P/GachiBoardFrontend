import { TestBed } from '@angular/core/testing';

import { TimeTimerManagerService } from './time-timer-manager.service';

describe('TimeTimerManagerService', () => {
  let service: TimeTimerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeTimerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
