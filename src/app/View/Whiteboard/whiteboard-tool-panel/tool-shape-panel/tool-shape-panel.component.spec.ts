import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolShapePanelComponent } from './tool-shape-panel.component';

describe('ToolShapePanelComponent', () => {
  let component: ToolShapePanelComponent;
  let fixture: ComponentFixture<ToolShapePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolShapePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolShapePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
