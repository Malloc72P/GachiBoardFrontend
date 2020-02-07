import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GachiLeftSidebarComponent } from './gachi-left-sidebar.component';

describe('GachiLeftSidebarComponent', () => {
  let component: GachiLeftSidebarComponent;
  let fixture: ComponentFixture<GachiLeftSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GachiLeftSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GachiLeftSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
