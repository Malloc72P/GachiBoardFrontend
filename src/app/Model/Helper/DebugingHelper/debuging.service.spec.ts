import { TestBed } from '@angular/core/testing';

import { DebugingService } from './debuging.service';

describe('DebugingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DebugingService = TestBed.get(DebugingService);
    expect(service).toBeTruthy();
  });
});
