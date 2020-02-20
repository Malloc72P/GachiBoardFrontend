import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GachiRightSidebarComponent } from './gachi-right-sidebar.component';

describe('GachiRightSidebarComponent', () => {
  let component: GachiRightSidebarComponent;
  let fixture: ComponentFixture<GachiRightSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GachiRightSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GachiRightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
