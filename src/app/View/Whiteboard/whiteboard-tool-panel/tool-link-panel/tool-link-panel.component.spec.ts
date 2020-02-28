import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolLinkPanelComponent } from './tool-link-panel.component';

describe('ToolLinkPanelComponent', () => {
  let component: ToolLinkPanelComponent;
  let fixture: ComponentFixture<ToolLinkPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolLinkPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolLinkPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
