import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPanelForLineComponent } from './sub-panel-for-line.component';

describe('HorizonContextMenuSubPanelForLineComponent', () => {
  let component: SubPanelForLineComponent;
  let fixture: ComponentFixture<SubPanelForLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubPanelForLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPanelForLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
