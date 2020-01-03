import { TestBed } from '@angular/core/testing';

import { InfiniteCanvasService } from './infinite-canvas.service';

describe('InfiniteCanvasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InfiniteCanvasService = TestBed.get(InfiniteCanvasService);
    expect(service).toBeTruthy();
  });
});
