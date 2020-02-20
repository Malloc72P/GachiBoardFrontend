import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPanelForFontComponent } from './sub-panel-for-font.component';

describe('SubPanelForFontComponent', () => {
  let component: SubPanelForFontComponent;
  let fixture: ComponentFixture<SubPanelForFontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubPanelForFontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPanelForFontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
