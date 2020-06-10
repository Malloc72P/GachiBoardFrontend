import { TestBed } from '@angular/core/testing';

import { CloudStorageEventManagerService } from './cloud-storage-event-manager.service';

describe('CloudStorageEventManagerService', () => {
  let service: CloudStorageEventManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudStorageEventManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
