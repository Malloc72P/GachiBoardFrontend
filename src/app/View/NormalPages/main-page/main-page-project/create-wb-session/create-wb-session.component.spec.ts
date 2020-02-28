import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWbSessionComponent } from './create-wb-session.component';

describe('CreateWbSessionComponent', () => {
  let component: CreateWbSessionComponent;
  let fixture: ComponentFixture<CreateWbSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateWbSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWbSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
