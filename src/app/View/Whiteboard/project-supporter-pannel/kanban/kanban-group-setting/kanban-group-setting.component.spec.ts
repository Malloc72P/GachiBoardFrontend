import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanGroupSettingComponent } from './kanban-group-setting.component';

describe('KanbanGroupSettingComponent', () => {
  let component: KanbanGroupSettingComponent;
  let fixture: ComponentFixture<KanbanGroupSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanGroupSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanGroupSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
