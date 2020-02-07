import { TestBed } from '@angular/core/testing';

import { GachiSidebarManagerService } from './gachi-sidebar-manager.service';

describe('GachiSidebarManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GachiSidebarManagerService = TestBed.get(GachiSidebarManagerService);
    expect(service).toBeTruthy();
  });
});
