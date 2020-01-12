import { TestBed } from '@angular/core/testing';

import { KanbanItemColorService } from './kanban-item-color.service';

describe('KanbanItemColorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanbanItemColorService = TestBed.get(KanbanItemColorService);
    expect(service).toBeTruthy();
  });
});
