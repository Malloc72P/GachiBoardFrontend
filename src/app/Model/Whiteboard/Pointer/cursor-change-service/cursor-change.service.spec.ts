import { TestBed } from '@angular/core/testing';

import { CursorChangeService } from './cursor-change.service';

describe('CursorChangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CursorChangeService = TestBed.get(CursorChangeService);
    expect(service).toBeTruthy();
  });
});
