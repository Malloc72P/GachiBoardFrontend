import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanTagManagementComponent } from './kanban-tag-management.component';

describe('KanbanTagManagementComponent', () => {
  let component: KanbanTagManagementComponent;
  let fixture: ComponentFixture<KanbanTagManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanTagManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanTagManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
