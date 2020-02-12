import { TestBed } from '@angular/core/testing';

import { ProjectRequesterService } from './project-requester.service';

describe('ProjectRequesterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectRequesterService = TestBed.get(ProjectRequesterService);
    expect(service).toBeTruthy();
  });
});
