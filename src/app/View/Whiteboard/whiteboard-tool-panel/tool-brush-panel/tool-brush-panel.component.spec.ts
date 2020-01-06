import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolBrushPanelComponent } from './tool-brush-panel.component';

describe('ToolBrushPanelComponent', () => {
  let component: ToolBrushPanelComponent;
  let fixture: ComponentFixture<ToolBrushPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolBrushPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolBrushPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
