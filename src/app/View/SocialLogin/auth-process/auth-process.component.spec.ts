import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthProcessComponent } from './auth-process.component';

describe('AuthProcessComponent', () => {
  let component: AuthProcessComponent;
  let fixture: ComponentFixture<AuthProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
