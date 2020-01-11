import { TestBed } from '@angular/core/testing';

import { KanbanTagListManagerService } from './kanban-tag-list-manager.service';

describe('KanbanTagListManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanbanTagListManagerService = TestBed.get(KanbanTagListManagerService);
    expect(service).toBeTruthy();
  });
});
