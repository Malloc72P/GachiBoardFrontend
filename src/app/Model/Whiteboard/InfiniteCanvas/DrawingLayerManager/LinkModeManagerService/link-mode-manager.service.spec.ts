import { TestBed } from '@angular/core/testing';

import { LinkModeManagerService } from './link-mode-manager.service';

describe('LinkModeManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LinkModeManagerService = TestBed.get(LinkModeManagerService);
    expect(service).toBeTruthy();
  });
});
