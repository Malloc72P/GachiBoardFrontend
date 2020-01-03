import { TestBed } from '@angular/core/testing';

import { PointerModeEnumService } from './pointer-mode-enum.service';

describe('PointerModeEnumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PointerModeEnumService = TestBed.get(PointerModeEnumService);
    expect(service).toBeTruthy();
  });
});
