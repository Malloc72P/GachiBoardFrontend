import { TestBed } from '@angular/core/testing';

import { AuthProcessService } from './auth-process.service';

describe('AuthProcessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthProcessService = TestBed.get(AuthProcessService);
    expect(service).toBeTruthy();
  });
});
