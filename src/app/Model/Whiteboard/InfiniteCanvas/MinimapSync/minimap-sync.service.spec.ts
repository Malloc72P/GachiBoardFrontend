import { TestBed } from '@angular/core/testing';

import { MinimapSyncService } from './minimap-sync.service';

describe('MinimapSyncService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MinimapSyncService = TestBed.get(MinimapSyncService);
    expect(service).toBeTruthy();
  });
});
