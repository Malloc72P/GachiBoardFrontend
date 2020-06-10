import {EventEmitter, Injectable} from '@angular/core';
import {FileMetadataDto, FileTypeEnum} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';

import {MatDialog} from '@angular/material/dialog';
import {CloudStorageCreateFolderComponent} from '../../../View/NormalPages/cloud-storage/cloud-storage-create-folder/cloud-storage-create-folder.component';
import {AreYouSurePanelService} from '../../PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {CloudStorageRequesterService} from '../../../Controller/CloudStorage/cloud-storage-requester.service';
import {
  CloudStorageInfoViewerComponent,
  FileInfoViewerData
} from '../../../View/NormalPages/cloud-storage/cloud-storage-info-viewer/cloud-storage-info-viewer.component';
import {
  CloudStorageRenameFileComponent,
  RenameCloudItemDialogData
} from '../../../View/NormalPages/cloud-storage/cloud-storage-rename-file/cloud-storage-rename-file.component';
import {
  CloudProgressAction,
  CloudProgressData,
  CloudProgressPanelComponent
} from '../../../View/NormalPages/cloud-storage/cloud-progress-panel/cloud-progress-panel.component';
import {CommonSnackbarService} from '../common-snackbar/common-snackbar.service';

export class CloudLocalEvent {
  public action:CloudLocalEventEnum;
  public data;
  public additionalData;

  constructor(action: CloudLocalEventEnum, data, additionalData?) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}
export class PathStack {
  currPathName;
  currStack:Array<string>;
}
export enum CloudLocalEventEnum {
  DIRECTORY_CHANGED,
}
@Injectable({
  providedIn: 'root'
})
export class CloudStorageManagerService {
  public cloudRoot:FileMetadataDto;
  public currDirectory:FileMetadataDto;
  public cloudStorageLocalEventEmitter:EventEmitter<any>;
  constructor(
    public dialog: MatDialog,
    public websocketManagerService:WebsocketManagerService,
    public areYouSurePanelService:AreYouSurePanelService,
    public cloudStorageRequesterService:CloudStorageRequesterService,
    public commonSnackbarService:CommonSnackbarService,
  ) {
    this.cloudStorageLocalEventEmitter = new EventEmitter<any>();
  }
  public async getFileListOfPath(path):Promise<any>{
    return new Promise<any>((resolve)=>{
      this.cloudStorageRequesterService
        .getFileList(path, this.websocketManagerService.currentProjectDto._id)
        .subscribe((currDirectory:FileMetadataDto)=>{
        console.log("CloudStorageManagerService >>  >> currDirectory : ",currDirectory);
        this.currDirectory = currDirectory;
        resolve(this.currDirectory);
      });
    });
  }
  private idGen = 0;
  getId(){
    return this.idGen++;
  }
  getIconByFileType(fileType:FileTypeEnum){
    // console.log("CloudStorageManagerService >> getIconByFileType >> fileType : ",fileType);
    let iconName = null;
    switch (fileType) {
      case FileTypeEnum.DIRECTORY:
        iconName = "folder";
        break;
      case FileTypeEnum.VIDEO:
        iconName = "movie";
        break;
      case FileTypeEnum.AUDIO:
        iconName = "audiotrack";
        break;
      case FileTypeEnum.IMAGE:
        iconName = "image";
        break;
      case FileTypeEnum.DOCUMENT:
        iconName = "text_snippet";
        break;
      case FileTypeEnum.COMPRESSED_FILE:
        iconName = "description";
        break;
      case FileTypeEnum.ETC:
        iconName = "description";
        break;
      default:
        iconName = "description"
    }
    return iconName;
  }
  getCurrPath(directory:FileMetadataDto){
    if(directory.path){
      return `${directory.path}${directory._id},`;
    }else{
      //root인 경우 path값이 null이다
      return `,${directory._id},`;
    }
  }
  addPath(currPath, appendPath){
    return currPath + `${appendPath},`;
  }
  accessFile(fileMetadataDto:FileMetadataDto, action?){
    switch (fileMetadataDto.type) {
      case FileTypeEnum.DIRECTORY:
        this.moveToTargetDirectory(fileMetadataDto, action);
        break;
      case FileTypeEnum.VIDEO:
      case FileTypeEnum.IMAGE:
      case FileTypeEnum.DOCUMENT:
      case FileTypeEnum.COMPRESSED_FILE:
      case FileTypeEnum.ETC:
        this.downloadFile(fileMetadataDto);
        break;
    }
  }
  moveToTargetDirectory(directory:FileMetadataDto, action){
    let currPath;
    let newPath;
    if(action === "descend"){
      currPath = this.getCurrPath(this.currDirectory);
      newPath = this.addPath(currPath, directory._id);
    }else{
      console.log("CloudStorageManagerService >> moveToTargetDirectory >> directory : ",directory);
      newPath = this.getCurrPath(directory);
      /*if (directory.path !== null) {
        newPath = this.addPath(currPath, directory._id);
      }*/
    }
    console.log("CloudStorageManagerService >> moveToTargetDirectory >> newPath : ",newPath);
    this.getFileListOfPath(newPath).then((currDirectory:FileMetadataDto)=>{
      console.log("CloudStorageComponent >> moveToTargetDirectory >> currDirectory : ",currDirectory);
      this.currDirectory = currDirectory;
      this.cloudStorageLocalEventEmitter.emit(
        new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, this.currDirectory, action));
    });
  }
  createFolder(currPath:FileMetadataDto){
    const dialogRef = this.dialog.open(CloudStorageCreateFolderComponent, {
      width: '480px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        //console.log("KanbanComponent >>  >> result : ",result);
        if(!result.createFlag || !result.title){
          return;
        }
        let folderName = result.title;
        this.cloudStorageRequesterService.createFolder(
          this.websocketManagerService.currentProjectDto._id,
          folderName,
          this.getCurrPath(currPath)
        ).subscribe((refreshedDirectory:FileMetadataDto)=>{
          this.currDirectory = refreshedDirectory;
          this.cloudStorageLocalEventEmitter.emit(
            new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, this.currDirectory, "stay"));

        });
      }
    });
  }
  deleteFile(fileMetadata:FileMetadataDto){
    this.areYouSurePanelService.openAreYouSurePanel("정말로 삭제하시겠습니까?",
      "이 작업은 되돌릴 수 없습니다.").subscribe((answer)=>{
        if(!answer){
          return;
        }
      this.cloudStorageRequesterService.deleteFile(
        this.websocketManagerService.currentProjectDto._id,
        fileMetadata._id
      ).subscribe((refreshedDirectory:FileMetadataDto)=>{
        this.currDirectory = refreshedDirectory;
        this.cloudStorageLocalEventEmitter.emit(
          new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, this.currDirectory, "stay"));

      });

    });
  }
  taskComplete(){
    this.commonSnackbarService.openSnackBar("작업이 완료되었어요!","close");
  }
  uploadFile(fileList:FileList, currPath:FileMetadataDto){
    let progressEventEmitter:EventEmitter<any> = new EventEmitter<any>();
    const dialogRef = this.dialog.open(CloudProgressPanelComponent, {
      width: '480px',
      data: new CloudProgressData(progressEventEmitter, CloudProgressAction.upload, "파일을 업로드 하고 있어요")
    });

    this.cloudStorageRequesterService.uploadFile(
      this.websocketManagerService.currentProjectDto._id, fileList, this.getCurrPath(currPath))
      .subscribe((refreshedDirectory:FileMetadataDto)=>{
        progressEventEmitter.emit();
        this.taskComplete();
        this.currDirectory = refreshedDirectory;
        this.cloudStorageLocalEventEmitter.emit(
          new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, this.currDirectory, "stay"));
      });
  }
  downloadFile(fileMetadataDto:FileMetadataDto){
    let progressEventEmitter:EventEmitter<any> = new EventEmitter<any>();
    const dialogRef = this.dialog.open(CloudProgressPanelComponent, {
      width: '480px',
      data: new CloudProgressData(progressEventEmitter, CloudProgressAction.download, "파일을 다운로드하고 있어요")
    });

    this.cloudStorageRequesterService.downloadFile(fileMetadataDto.filePointer)
      .subscribe((data:Blob)=>{
        console.log("CloudStorageManagerService >>  >> data : ",data);

        let downloadLink = window.URL.createObjectURL(data);
        let link= document.createElement("a");
        link.href = downloadLink;
        link.download = fileMetadataDto.title;
        link.click();

        progressEventEmitter.emit();
        this.taskComplete();
      });
  }
  openFileInfoPanel(fileMetadata:FileMetadataDto, mode){
    const dialogRef = this.dialog.open(CloudStorageInfoViewerComponent, {
      width: '480px',
      data: new FileInfoViewerData(fileMetadata, mode)
    });
  }
  renameFile(fileMetadata:FileMetadataDto){
    const dialogRef = this.dialog.open(CloudStorageRenameFileComponent, {
      width: '480px',
      data: new RenameCloudItemDialogData(fileMetadata)
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        if(!result.createFlag || !result.title){
          return;
        }
        let newName = result.title;
        this.cloudStorageRequesterService.renameFile(
          this.websocketManagerService.currentProjectDto._id,
          fileMetadata._id,
          newName
        ).subscribe((refreshedDirectory:FileMetadataDto)=>{
          this.currDirectory = refreshedDirectory;
          this.cloudStorageLocalEventEmitter.emit(
            new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, this.currDirectory, "stay"));

        });
      }
    })
  }


}
