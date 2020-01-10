import { TestBed } from '@angular/core/testing';

import { ProjectSupporterEnumService } from './project-supporter-enum.service';

describe('ProjectSupporterEnumService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectSupporterEnumService = TestBed.get(ProjectSupporterEnumService);
    expect(service).toBeTruthy();
  });
});
