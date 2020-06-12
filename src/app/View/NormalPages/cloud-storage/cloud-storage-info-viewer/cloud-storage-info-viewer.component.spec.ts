import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudStorageInfoViewerComponent } from './cloud-storage-info-viewer.component';

describe('CloudStorageInfoViewerComponent', () => {
  let component: CloudStorageInfoViewerComponent;
  let fixture: ComponentFixture<CloudStorageInfoViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudStorageInfoViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudStorageInfoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
