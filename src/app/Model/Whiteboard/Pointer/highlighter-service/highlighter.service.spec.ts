import { TestBed } from '@angular/core/testing';

import { HighlighterService } from './highlighter.service';

describe('HighlighterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HighlighterService = TestBed.get(HighlighterService);
    expect(service).toBeTruthy();
  });
});
