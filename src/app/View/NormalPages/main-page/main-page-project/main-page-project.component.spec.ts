import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPageProjectComponent } from './main-page-project.component';

describe('MainPageProjectComponent', () => {
  let component: MainPageProjectComponent;
  let fixture: ComponentFixture<MainPageProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPageProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPageProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
