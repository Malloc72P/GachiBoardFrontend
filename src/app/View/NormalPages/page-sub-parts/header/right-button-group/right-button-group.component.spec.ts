import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightButtonGroupComponent } from './right-button-group.component';

describe('RightButtonGroupComponent', () => {
  let component: RightButtonGroupComponent;
  let fixture: ComponentFixture<RightButtonGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightButtonGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
