import { TestBed } from '@angular/core/testing';

import { PopupManagerService } from './popup-manager.service';

describe('PopupManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PopupManagerService = TestBed.get(PopupManagerService);
    expect(service).toBeTruthy();
  });
});
