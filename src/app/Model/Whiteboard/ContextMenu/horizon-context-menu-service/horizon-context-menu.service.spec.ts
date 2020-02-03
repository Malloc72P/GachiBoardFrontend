import { TestBed } from '@angular/core/testing';

import { HorizonContextMenuService } from './horizon-context-menu.service';

describe('HorizonContextMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HorizonContextMenuService = TestBed.get(HorizonContextMenuService);
    expect(service).toBeTruthy();
  });
});
