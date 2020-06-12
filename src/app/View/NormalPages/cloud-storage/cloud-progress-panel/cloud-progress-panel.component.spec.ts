import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudProgressPanelComponent } from './cloud-progress-panel.component';

describe('CloudProgressPanelComponent', () => {
  let component: CloudProgressPanelComponent;
  let fixture: ComponentFixture<CloudProgressPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudProgressPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudProgressPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
