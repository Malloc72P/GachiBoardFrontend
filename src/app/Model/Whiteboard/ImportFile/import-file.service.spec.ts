import { TestBed } from '@angular/core/testing';

import { ImportFileService } from './import-file.service';

describe('ImportFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImportFileService = TestBed.get(ImportFileService);
    expect(service).toBeTruthy();
  });
});
