import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInviteCodeComponent } from './create-invite-code.component';

describe('CreateInviteCodeComponent', () => {
  let component: CreateInviteCodeComponent;
  let fixture: ComponentFixture<CreateInviteCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateInviteCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInviteCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
