import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonContextMenuComponent } from './horizon-context-menu.component';

describe('HorizonContextMenuComponent', () => {
  let component: HorizonContextMenuComponent;
  let fixture: ComponentFixture<HorizonContextMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonContextMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
