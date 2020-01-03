import { TestBed } from '@angular/core/testing';

import { RouterHelperService } from './router-helper.service';

describe('RouterHelperServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouterHelperService = TestBed.get(RouterHelperService);
    expect(service).toBeTruthy();
  });
});
