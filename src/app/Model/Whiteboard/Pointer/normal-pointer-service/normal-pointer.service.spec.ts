import { TestBed } from '@angular/core/testing';

import { NormalPointerService } from './normal-pointer.service';

describe('NormalPointerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NormalPointerService = TestBed.get(NormalPointerService);
    expect(service).toBeTruthy();
  });
});
