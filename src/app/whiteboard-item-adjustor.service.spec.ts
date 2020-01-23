import { TestBed } from '@angular/core/testing';

import { WhiteboardItemAdjustorService } from './whiteboard-item-adjustor.service';

describe('WhiteboardItemAdjustorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WhiteboardItemAdjustorService = TestBed.get(WhiteboardItemAdjustorService);
    expect(service).toBeTruthy();
  });
});
