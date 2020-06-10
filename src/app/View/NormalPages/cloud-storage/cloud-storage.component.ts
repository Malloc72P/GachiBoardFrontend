import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {
  CloudLocalEvent, CloudLocalEventEnum,
  CloudStorageManagerService
} from '../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';
import {FileMetadataDto} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import {MatMenuTrigger} from '@angular/material/menu';


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
  public pathStack:Array<FileMetadataDto> = new Array<FileMetadataDto>();
  public isSidebarOpened = true;
  public menuPosX = 0;
  public menuPosY = 0;

  @ViewChild('fileUploadInput') fileUploadInput: ElementRef;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

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
  stepBackward(){
    this.cloudService.moveToTargetDirectory(this.pathStack[this.pathStack.length - 2], 'ascend');
  }
  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  uploadFile() {
    document.getElementById("fileUploadInput").click();
  }

  onFileChangeMultiple() {
    let fileObjects = this.fileUploadInput.nativeElement.files;
    this.cloudService.uploadFile(fileObjects, this.currDirectory);

    // this.importFileService.importFile(fileObjects)
  }
  onRightClick(event){
    event.preventDefault();
    console.log("CloudStorageComponent >> onRightClick >> event : ",event);
    this.menuPosX = event.layerX;
    this.menuPosY = event.layerY;
    this.matMenuTrigger.openMenu();
  }

}
