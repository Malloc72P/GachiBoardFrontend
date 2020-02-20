import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPageRootComponent } from './main-page-root.component';

describe('MainPageRootComponent', () => {
  let component: MainPageRootComponent;
  let fixture: ComponentFixture<MainPageRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPageRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPageRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
