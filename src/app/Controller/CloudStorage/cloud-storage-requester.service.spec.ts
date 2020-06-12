import { TestBed } from '@angular/core/testing';

import { CloudStorageRequesterService } from './cloud-storage-requester.service';

describe('CloudStorageRequesterService', () => {
  let service: CloudStorageRequesterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudStorageRequesterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
