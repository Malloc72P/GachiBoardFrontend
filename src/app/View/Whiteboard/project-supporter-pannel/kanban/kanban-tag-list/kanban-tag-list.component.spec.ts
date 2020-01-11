import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanTagListComponent } from './kanban-tag-list.component';

describe('KanbanTagListComponent', () => {
  let component: KanbanTagListComponent;
  let fixture: ComponentFixture<KanbanTagListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanTagListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
