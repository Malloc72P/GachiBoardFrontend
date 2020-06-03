import {EventEmitter, Injectable} from '@angular/core';
import {FileMetadataDto, FileTypeEnum} from '../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';

export class CloudLocalEvent {
  public action:CloudLocalEventEnum;
  public data;


  constructor(action: CloudLocalEventEnum, data) {
    this.action = action;
    this.data = data;
  }
}
export enum CloudLocalEventEnum {
  DIRECTORY_CHANGED,
}
@Injectable({
  providedIn: 'root'
})
export class CloudStorageManagerService {
  public cloudRoot:FileMetadataDto;
  public cloudStorageLocalEventEmitter:EventEmitter<any>;
  constructor() {
    this.cloudStorageLocalEventEmitter = new EventEmitter<any>();
    this.getCloudStorageDB();
  }
  public getCloudStorageDB(){
    this.cloudRoot = new FileMetadataDto( this.getId(),
      "root",FileTypeEnum.DIRECTORY,0,"ayana1234","아야나",new Date()
    );

    this.cloudRoot.children.push(
      new FileMetadataDto( this.getId(),
        "스커트 모델링",FileTypeEnum.DOCUMENT,212,"ayana1234","아야나",
        new Date()
      )
    );
    this.cloudRoot.children.push(
      new FileMetadataDto( this.getId(),
        "바이저 모델링",FileTypeEnum.DOCUMENT,212,"ayana1234","아야나",
        new Date()
      )
    );
    this.cloudRoot.children.push(
      new FileMetadataDto( this.getId(),
        "오퍼레이터 2B 전투기록영상",FileTypeEnum.VIDEO,212,"ayana1234","아야나",
        new Date()
      )
    );
    let testDir:FileMetadataDto = new FileMetadataDto( this.getId(),
      "2B 스켈레톤",FileTypeEnum.DIRECTORY,212,"ayana1234","아야나", new Date());
    testDir.children.push( new FileMetadataDto( this.getId(), "하체 골격",FileTypeEnum.DOCUMENT,212,"ayana1234","아야나", new Date() ));
    testDir.children.push( new FileMetadataDto( this.getId(), "상체 골격",FileTypeEnum.DOCUMENT,212,"ayana1234","아야나", new Date() ));
    testDir.children.push( new FileMetadataDto( this.getId(), "머리 뼈대",FileTypeEnum.DOCUMENT,212,"ayana1234","아야나", new Date() ));
    this.cloudRoot.children.push(testDir);
  }
  private idGen = 0;
  getId(){
    return this.idGen++;
  }
  getIconByFileType(fileType:FileTypeEnum){
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
  getCurrPathByMetadata(fileMetadataDto:FileMetadataDto){
    let pathStack:Array<FileMetadataDto> = new Array<FileMetadataDto>();
    let findIt = this.findFile(this.cloudRoot, fileMetadataDto, pathStack);

    console.log("CloudStorageManagerService >> getCurrPathByMetadata >> findIt : ",findIt);
    return pathStack;
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
  accessFile(fileMetadataDto:FileMetadataDto){
    switch (fileMetadataDto.type) {
      case FileTypeEnum.DIRECTORY:
        this.moveToTargetDirectory(fileMetadataDto);
        break;
      case FileTypeEnum.VIDEO:
        break;
      case FileTypeEnum.IMAGE:
        break;
      case FileTypeEnum.DOCUMENT:
        break;
      case FileTypeEnum.COMPRESSED_FILE:
        break;
      case FileTypeEnum.ETC:
        break;
    }
  }
  moveToTargetDirectory(directory:FileMetadataDto){
    this.cloudStorageLocalEventEmitter.emit(
      new CloudLocalEvent(CloudLocalEventEnum.DIRECTORY_CHANGED, directory));
  }
}
