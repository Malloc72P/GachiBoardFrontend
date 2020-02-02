import { TestBed } from '@angular/core/testing';

import { WhiteboardItemFactoryService } from './whiteboard-item-factory.service';

describe('WhiteboardItemFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WhiteboardItemFactoryService = TestBed.get(WhiteboardItemFactoryService);
    expect(service).toBeTruthy();
  });
});
