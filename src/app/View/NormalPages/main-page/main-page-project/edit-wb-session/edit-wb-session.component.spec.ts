import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWbSessionComponent } from './edit-wb-session.component';

describe('EditWbSessionComponent', () => {
  let component: EditWbSessionComponent;
  let fixture: ComponentFixture<EditWbSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditWbSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWbSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
