import { TestBed } from '@angular/core/testing';

import { ApiRequesterService } from './api-requester.service';

describe('ApiRequesterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiRequesterService = TestBed.get(ApiRequesterService);
    expect(service).toBeTruthy();
  });
});
