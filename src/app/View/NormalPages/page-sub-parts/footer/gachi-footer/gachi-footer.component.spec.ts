import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GachiFooterComponent } from './gachi-footer.component';

describe('GachiFooterComponent', () => {
  let component: GachiFooterComponent;
  let fixture: ComponentFixture<GachiFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GachiFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GachiFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
