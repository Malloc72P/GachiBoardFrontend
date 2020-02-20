import { TestBed } from '@angular/core/testing';

import { CursorTrackerService } from './cursor-tracker.service';

describe('CursorTrackerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CursorTrackerService = TestBed.get(CursorTrackerService);
    expect(service).toBeTruthy();
  });
});
