import { TestBed } from '@angular/core/testing';

import { AreYouSurePanelService } from './are-you-sure-panel.service';

describe('AreYouSurePanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AreYouSurePanelService = TestBed.get(AreYouSurePanelService);
    expect(service).toBeTruthy();
  });
});
