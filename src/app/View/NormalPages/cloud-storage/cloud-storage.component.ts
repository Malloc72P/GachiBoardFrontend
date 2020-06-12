import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ProjectDto} from '../../../DTO/ProjectDto/project-dto';
import {MatDialogRef} from '@angular/material/dialog';
import {CloudStorageManagerService} from '../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';
import {FileMetadataDto, FileTypeEnum} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import {MatMenuTrigger} from '@angular/material/menu';
import {
  CloudLocalEvent,
  CloudLocalEventEnum
} from '../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-event-manager/cloud-storage-event-manager.service';
import {AreYouSurePanelService} from '../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';


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
    public areYouSurePanelService: AreYouSurePanelService,
  ) {
    console.log("CloudStorageComponent >> constructor >> 진입함");
    this.currDirectory = new FileMetadataDto(
      "","","","","","","","",""
    );
    this.getRootsFileList();
    // this.currDirectory = this.cloudService.cloudRoot;
    // this.pathStack = this.cloudService.getCurrPathByMetadata(this.currDirectory);

    this.cloudService.cloudStorageLocalEventEmitter.subscribe((localEvent:CloudLocalEvent)=>{
      console.log("CloudStorageComponent >>  >> localEvent : ",localEvent);
      let emitBy;
      let updatedDirectory:FileMetadataDto;
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
        case CloudLocalEventEnum.UPDATED_BY_WS :
          emitBy = localEvent.additionalData;
          updatedDirectory = localEvent.data;
          console.log("CloudStorageComponent >> UPDATED_BY_WS >> updatedDirectory : ",updatedDirectory);
          if(emitBy === this.cloudService.websocketManagerService.userInfo.idToken){
            return;
          }
          if(this.currDirectory.path === updatedDirectory.path){
            this.cloudService.currDirectory = updatedDirectory;
            this.currDirectory = updatedDirectory;
          }else{
            for (let i = 0 ; i < this.pathStack.length - 1 ; i++){
              let currDirectory:FileMetadataDto = this.pathStack[i];
              if(currDirectory._id === updatedDirectory._id){
                let nextStack = this.pathStack[i + 1];
                if(nextStack){
                    for (let childFile of updatedDirectory.children){
                      if(childFile._id === nextStack._id){
                        nextStack.title = childFile.title;
                      }
                    }
                }
                break;
              }
            }
          }
          break;
        case CloudLocalEventEnum.DELETED_BY_WS :
          emitBy = localEvent.additionalData;
          let deletedFileMetadata:FileMetadataDto = localEvent.data;
          console.log("CloudStorageComponent >> DELETED_BY_WS >> deletedFileMetadata : ",deletedFileMetadata);
          if(emitBy === this.cloudService.websocketManagerService.userInfo.idToken){
            return;
          }
          if(deletedFileMetadata.type === FileTypeEnum.DIRECTORY){
            if(deletedFileMetadata._id === this.currDirectory._id){
              //현재 위치가 삭제됨. 에러메세지 출력 후, 루트로 강제 이동시킴
              this.areYouSurePanelService
                .openAreYouSurePanel("다른 유저가 당신이 있는 폴더를 삭제했어요!"
                ,"최상위 폴더로 이동합니다", true).subscribe(()=>{
                  this.getRootsFileList();
              });
              return;
            }

            for (let i = 0 ; i < this.pathStack.length - 1 ; i++){
              let currDir:FileMetadataDto = this.pathStack[i];
              if(currDir._id === deletedFileMetadata._id){
                //상위 디렉토리가 삭제됨. 에러메세지 출력 후 루트로 강제이동시킴
                this.areYouSurePanelService
                  .openAreYouSurePanel("다른 유저가 당신이 있는 폴더의 상위 폴더를 삭제했어요!"
                    ,"최상위 폴더로 이동합니다", true).subscribe(()=>{
                  this.getRootsFileList();
                });
                return;

              }
            }
          }
          let currPath = this.cloudService.getCurrPath(this.currDirectory);
          console.log("CloudStorageComponent >>  >> currPath : ",currPath);
          if(deletedFileMetadata.path === currPath){
            //내 경로에서 삭제가 발생함. 정보를 새로 가져와야함
            this.cloudService.moveToTargetDirectory(this.currDirectory, "stay");
          }
          break;
      }
    });
  }
  getRootsFileList(){
    this.pathStack.splice(0, this.pathStack.length);
    this.cloudService.getFileListOfPath(",").then((currDirectory:FileMetadataDto)=>{
      console.log("CloudStorageComponent >>  >> currDirectory : ",currDirectory);
      this.currDirectory = currDirectory;
      this.pathStack.push(currDirectory);
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
