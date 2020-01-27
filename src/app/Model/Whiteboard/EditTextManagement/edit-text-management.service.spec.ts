import { TestBed } from '@angular/core/testing';

import { EditTextManagementService } from './edit-text-management.service';

describe('EditTextManagementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EditTextManagementService = TestBed.get(EditTextManagementService);
    expect(service).toBeTruthy();
  });
});
