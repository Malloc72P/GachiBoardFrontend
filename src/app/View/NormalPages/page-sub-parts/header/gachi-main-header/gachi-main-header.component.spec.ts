import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GachiMainHeaderComponent } from './gachi-main-header.component';

describe('GachiMainHeaderComponent', () => {
  let component: GachiMainHeaderComponent;
  let fixture: ComponentFixture<GachiMainHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GachiMainHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GachiMainHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
