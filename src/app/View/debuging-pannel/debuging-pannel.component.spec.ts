import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugingPannelComponent } from './debuging-pannel.component';

describe('DebugingPannelComponent', () => {
  let component: DebugingPannelComponent;
  let fixture: ComponentFixture<DebugingPannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugingPannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugingPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
