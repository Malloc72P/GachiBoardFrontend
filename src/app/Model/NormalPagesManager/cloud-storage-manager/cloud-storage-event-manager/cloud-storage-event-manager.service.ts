import {EventEmitter, Injectable} from '@angular/core';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';

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
export enum CloudLocalEventEnum {
  DIRECTORY_CHANGED,
  UPDATED_BY_WS,
  DELETED_BY_WS
}

@Injectable({
  providedIn: 'root'
})
export class CloudStorageEventManagerService {
  public cloudStorageLocalEventEmitter:EventEmitter<any> = new EventEmitter<any>();
  constructor() { }
}
