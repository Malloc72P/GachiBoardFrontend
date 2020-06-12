import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudStorageCreateFolderComponent } from './cloud-storage-create-folder.component';

describe('CloudStorageCreateFolderComponent', () => {
  let component: CloudStorageCreateFolderComponent;
  let fixture: ComponentFixture<CloudStorageCreateFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudStorageCreateFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudStorageCreateFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
