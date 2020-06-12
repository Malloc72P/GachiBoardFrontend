import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudStorageComponent } from './cloud-storage.component';

describe('CloudStorageComponent', () => {
  let component: CloudStorageComponent;
  let fixture: ComponentFixture<CloudStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
