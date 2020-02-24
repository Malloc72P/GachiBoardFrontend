import { TestBed } from '@angular/core/testing';

import { WbItemEventManagerService } from './wb-item-event-manager.service';

describe('WbItemEventManagerService', () => {
  let service: WbItemEventManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WbItemEventManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
