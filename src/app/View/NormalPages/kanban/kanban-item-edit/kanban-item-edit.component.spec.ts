import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanItemEditComponent } from './kanban-item-edit.component';

describe('KanbanItemEditComponent', () => {
  let component: KanbanItemEditComponent;
  let fixture: ComponentFixture<KanbanItemEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanItemEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
