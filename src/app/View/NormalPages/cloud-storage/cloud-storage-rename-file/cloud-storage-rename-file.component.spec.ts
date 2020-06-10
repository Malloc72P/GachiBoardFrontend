import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudStorageRenameFileComponent } from './cloud-storage-rename-file.component';

describe('CloudStorageRenameFileComponent', () => {
  let component: CloudStorageRenameFileComponent;
  let fixture: ComponentFixture<CloudStorageRenameFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudStorageRenameFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudStorageRenameFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
