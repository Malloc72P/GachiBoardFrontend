import { TestBed } from '@angular/core/testing';

import { PanelManagerService } from './panel-manager.service';

describe('PanelManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PanelManagerService = TestBed.get(PanelManagerService);
    expect(service).toBeTruthy();
  });
});
