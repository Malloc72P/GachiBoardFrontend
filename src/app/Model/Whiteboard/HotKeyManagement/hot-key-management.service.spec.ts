import { TestBed } from '@angular/core/testing';

import { HotKeyManagementService } from './hot-key-management.service';

describe('HotKeyManagementService', () => {
  let service: HotKeyManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotKeyManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
