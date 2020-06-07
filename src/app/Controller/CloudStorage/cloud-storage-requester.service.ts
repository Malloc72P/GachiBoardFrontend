import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ProjectDto} from '../../DTO/ProjectDto/project-dto';
import {HttpHelper} from '../../Model/Helper/http-helper/http-helper';
import {ApiRequesterService} from '../SocialLogin/api-requester/api-requester.service';
import {AuthRequestService} from '../SocialLogin/auth-request/auth-request.service';
import {UiService} from '../../Model/Helper/ui-service/ui.service';
import {FileMetadataDto} from '../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';

@Injectable({
  providedIn: 'root'
})
export class CloudStorageRequesterService {

  constructor(
    private apiRequester: ApiRequesterService,
    private authRequestService: AuthRequestService,
    private uiService: UiService,
  ) { }
  getFileList(path, projectId) :Observable<FileMetadataDto>{
    return new Observable<FileMetadataDto>((observer)=>{

      this.apiRequester.get( HttpHelper.api.cloudStorage.getFileListOfCurrPath.uri,
        {path : path, projectId : projectId} )
        .subscribe((data)=>{
          console.log("CloudStorageRequesterService >>  >> data : ",data);
          observer.next(data as FileMetadataDto);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });

  }
  createFolder(projectId, folderName, path) :Observable<FileMetadataDto>{
    return new Observable<FileMetadataDto>((observer)=>{

      this.apiRequester.post( HttpHelper.api.cloudStorage.createFolder.uri,
        {
          projectId   : projectId,
          folderName  : folderName,
          path        : path,
        } )
        .subscribe((data)=>{
          console.log("CloudStorageRequesterService >> createFolder >> data : ",data);
          observer.next(data as FileMetadataDto);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });

  }
  uploadFile(){

  }
}
