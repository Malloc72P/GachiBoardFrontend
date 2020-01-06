import { TestBed } from '@angular/core/testing';

import { CanvasMoverService } from './canvas-mover.service';

describe('CanvasMoverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CanvasMoverService = TestBed.get(CanvasMoverService);
    expect(service).toBeTruthy();
  });
});
