import { Component, OnInit } from '@angular/core';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  CloudLocalEvent, CloudLocalEventEnum,
  CloudStorageManagerService
} from '../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';
import {FileMetadataDto} from '../../../DTO/ProjectDto/FileMetadataDto/FileMetadataDto';

export class CloudStorageComponentData {
  projectDto:ProjectDto;
}


@Component({
  selector: 'app-cloud-storage',
  templateUrl: './cloud-storage.component.html',
  styleUrls: ['./cloud-storage.component.css',
    '../popup-pannel-commons.css',
    '../gachi-font.css',
    '../../../../scrolling.scss',
    '../../Whiteboard/project-supporter-pannel/project-supporter-pannel.component.css',]
})
export class CloudStorageComponent implements OnInit {
  public currDirectory:FileMetadataDto = null;
  public pathStack:Array<FileMetadataDto>;
  constructor(
    public dialogRef: MatDialogRef<CloudStorageComponent>,
    public cloudService: CloudStorageManagerService,
  ) {
    this.currDirectory = this.cloudService.cloudRoot;
    this.pathStack = this.cloudService.getCurrPathByMetadata(this.currDirectory);
    console.log("CloudStorageComponent >> constructor >> currDirectory : ",this.cloudService.getCurrPathByMetadata(this.currDirectory));
    this.cloudService.cloudStorageLocalEventEmitter.subscribe((localEvent:CloudLocalEvent)=>{
      switch (localEvent.action) {
        case CloudLocalEventEnum.DIRECTORY_CHANGED:
          this.currDirectory = localEvent.data;
          this.pathStack = this.cloudService.getCurrPathByMetadata(this.currDirectory);
          break;
      }
    });

  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
