import {EventEmitter, Injectable} from '@angular/core';
import {FileMetadataDto, FileTypeEnum} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import {WebsocketManagerService} from '../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';

import {MatDialog} from '@angular/material/dialog';
import {CloudStorageCreateFolderComponent} from '../../../View/NormalPages/cloud-storage/cloud-storage-create-folder/cloud-storage-create-folder.component';
import {AreYouSurePanelService} from '../../PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {CloudStorageRequesterService} from '../../../Controller/CloudStorage/cloud-storage-requester.service';

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
  getCurrPathByMetadata(fileMetadataDto:FileMetadataDto){
    // let pathStack:Array<FileMetadataDto> = new Array<FileMetadataDto>();
    // let findIt = this.findFile(this.cloudRoot, fileMetadataDto, pathStack);
    //
    // console.log("CloudStorageManagerService >> getCurrPathByMetadata >> findIt : ",findIt);
    // console.log("CloudStorageManagerService >> getCurrPathByMetadata >> pathStack : ",pathStack);
    // return pathStack;
  }
  findFile(currDirectory:FileMetadataDto, targetFile:FileMetadataDto, pathStack:Array<FileMetadataDto>){
    if(!currDirectory){
      return
    }
    let findIt = false;

    pathStack.push(currDirectory);

    if(currDirectory._id === targetFile._id){
      return true;
    }

    for (let currFile of currDirectory.children){
      if(currFile._id === targetFile._id){
        pathStack.push(currFile);
        return true;
      }
      if(currFile.type === FileTypeEnum.DIRECTORY){
        findIt = this.findFile(currFile, targetFile, pathStack);
        if(findIt){
          return true;
        }else pathStack.splice(pathStack.length - 1, 1);
      }
    }
    return findIt;
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
        let stackTrace:Array<FileMetadataDto> = new Array<FileMetadataDto>();
        // this.findFile(this.cloudRoot, fileMetadataDto, stackTrace);
        console.log("CloudStorageManagerService >> accessFile >> stackTrace : ",stackTrace);
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
        // currPath.children.push( new FileMetadataDto(
        //   this.getId(),title,FileTypeEnum.DIRECTORY,0,
        //   this.websocketManagerService.userInfo.idToken,this.websocketManagerService.userInfo.userName, new Date()) );
      }
    });
  }
  deleteFile(currPath:FileMetadataDto, tgtFile:FileMetadataDto){
    this.areYouSurePanelService.openAreYouSurePanel("정말로 삭제하시겠습니까?",
      "이 작업은 되돌릴 수 없습니다.").subscribe((answer)=>{
        if(!answer){
          return;
        }
        for (let i = 0 ; i < currPath.children.length; i++){
          let currItem = currPath.children[i];
          if(currItem._id === tgtFile._id){
            currPath.children.splice(i, 1);
            break;
          }
        }
    });
  }
}
