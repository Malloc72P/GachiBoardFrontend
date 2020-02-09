import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOverlayCardComponent } from './user-overlay-card.component';

describe('UserOverlayCardComponent', () => {
  let component: UserOverlayCardComponent;
  let fixture: ComponentFixture<UserOverlayCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserOverlayCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserOverlayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
