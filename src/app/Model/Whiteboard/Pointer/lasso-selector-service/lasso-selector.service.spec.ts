import { TestBed } from '@angular/core/testing';

import { LassoSelectorService } from './lasso-selector.service';

describe('LassoServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LassoSelectorService = TestBed.get(LassoSelectorService);
    expect(service).toBeTruthy();
  });
});
