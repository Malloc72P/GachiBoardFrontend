import { Component, OnInit } from '@angular/core';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  CloudLocalEvent, CloudLocalEventEnum,
  CloudStorageManagerService
} from '../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';
import {FileMetadataDto} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';


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
  public currPath = ",";
  public pathStack:Array<FileMetadataDto> = new Array<FileMetadataDto>();
  public isSidebarOpened = true;
  constructor(
    public dialogRef: MatDialogRef<CloudStorageComponent>,
    public cloudService: CloudStorageManagerService,
  ) {
    console.log("CloudStorageComponent >> constructor >> 진입함");
    this.currDirectory = new FileMetadataDto(
      "","","","","","","","",""
    );
    this.cloudService.getFileListOfPath(",").then((currDirectory:FileMetadataDto)=>{
      console.log("CloudStorageComponent >>  >> currDirectory : ",currDirectory);
      this.currDirectory = currDirectory;
      this.pathStack.push(currDirectory);
    });
    // this.currDirectory = this.cloudService.cloudRoot;
    // this.pathStack = this.cloudService.getCurrPathByMetadata(this.currDirectory);

    this.cloudService.cloudStorageLocalEventEmitter.subscribe((localEvent:CloudLocalEvent)=>{
      console.log("CloudStorageComponent >>  >> localEvent : ",localEvent);
      switch (localEvent.action) {
        case CloudLocalEventEnum.DIRECTORY_CHANGED:
          this.currDirectory = localEvent.data;
          if(localEvent.additionalData === "descend"){
            this.pathStack.push(this.currDirectory);
          }else if(localEvent.additionalData === "ascend"){
            console.log("CloudStorageComponent >>  >> pathStack : ",this.pathStack);
            console.log("CloudStorageComponent >>  >> currDirectory : ",this.currDirectory);
            for (let i = 0 ; i < this.pathStack.length; i++){
              let currPath:FileMetadataDto = this.pathStack[i];
              if(currPath._id === this.currDirectory._id){
                this.pathStack.splice(i + 1, this.pathStack.length - i);
                break;
              }
            }
          }
          // this.pathStack = this.cloudService.getCurrPathByMetadata(this.currDirectory);
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
