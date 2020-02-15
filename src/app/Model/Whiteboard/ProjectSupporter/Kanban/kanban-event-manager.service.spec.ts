import { TestBed } from '@angular/core/testing';

import { KanbanEventManagerService } from './kanban-event-manager.service';

describe('KanbanEventManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanbanEventManagerService = TestBed.get(KanbanEventManagerService);
    expect(service).toBeTruthy();
  });
});
