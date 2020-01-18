import { TestBed } from '@angular/core/testing';

import { DrawingLayerManagerService } from './drawing-layer-manager.service';

describe('DrawingLayerManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DrawingLayerManagerService = TestBed.get(DrawingLayerManagerService);
    expect(service).toBeTruthy();
  });
});
