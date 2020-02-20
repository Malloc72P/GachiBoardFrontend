import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GachiHeaderComponent } from './gachi-header.component';

describe('GachiHeaderComponent', () => {
  let component: GachiHeaderComponent;
  let fixture: ComponentFixture<GachiHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GachiHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GachiHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
