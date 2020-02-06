import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPanelForArrowComponent } from './sub-panel-for-arrow.component';

describe('SubPanelForArrowComponent', () => {
  let component: SubPanelForArrowComponent;
  let fixture: ComponentFixture<SubPanelForArrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubPanelForArrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPanelForArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
