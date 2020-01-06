import { TestBed } from '@angular/core/testing';

import { ZoomControlService } from './zoom-control.service';

describe('ZoomControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZoomControlService = TestBed.get(ZoomControlService);
    expect(service).toBeTruthy();
  });
});
