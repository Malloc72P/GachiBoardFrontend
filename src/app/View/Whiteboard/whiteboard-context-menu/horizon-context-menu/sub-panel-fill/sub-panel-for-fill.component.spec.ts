import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPanelForFillComponent } from './sub-panel-for-fill.component';

describe('SubPanelForFillComponent', () => {
  let component: SubPanelForFillComponent;
  let fixture: ComponentFixture<SubPanelForFillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubPanelForFillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPanelForFillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
