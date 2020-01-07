import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolHighlighterPanelComponent } from './tool-highlighter-panel.component';

describe('ToolHighlighterPanelComponent', () => {
  let component: ToolHighlighterPanelComponent;
  let fixture: ComponentFixture<ToolHighlighterPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolHighlighterPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolHighlighterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
