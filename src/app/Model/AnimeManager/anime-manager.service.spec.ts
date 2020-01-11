import { TestBed } from '@angular/core/testing';

import { AnimeManagerService } from './anime-manager.service';

describe('AnimeManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnimeManagerService = TestBed.get(AnimeManagerService);
    expect(service).toBeTruthy();
  });
});
