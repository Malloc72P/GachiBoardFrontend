import { TestBed } from '@angular/core/testing';

import { PointerModeManagerService } from './pointer-mode-manager.service';

describe('PointerModeManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PointerModeManagerService = TestBed.get(PointerModeManagerService);
    expect(service).toBeTruthy();
  });
});
