import { TestBed } from '@angular/core/testing';

import { CloudStorageManagerService } from './cloud-storage-manager.service';

describe('CloudStorageManagerService', () => {
  let service: CloudStorageManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudStorageManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
