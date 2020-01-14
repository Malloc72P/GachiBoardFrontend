import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreYouSurePanelComponent } from './are-you-sure-panel.component';

describe('AreYouSurePanelComponent', () => {
  let component: AreYouSurePanelComponent;
  let fixture: ComponentFixture<AreYouSurePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreYouSurePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreYouSurePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
