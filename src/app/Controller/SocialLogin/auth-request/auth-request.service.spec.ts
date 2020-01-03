import { TestBed } from '@angular/core/testing';

import { AuthRequestService } from './auth-request.service';

describe('AuthRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthRequestService = TestBed.get(AuthRequestService);
    expect(service).toBeTruthy();
  });
});
