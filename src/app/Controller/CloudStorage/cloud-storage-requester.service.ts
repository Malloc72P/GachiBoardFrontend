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
  uploadFile(projectId, files:FileList, path) :Observable<FileMetadataDto>{
    return new Observable<FileMetadataDto>((observer)=>{
      console.log("CloudStorageRequesterService >>  >> files : ",files);
      let formData:FormData = new FormData();
      formData.append("projectId", projectId);
      for(let i = 0 ; i < files.length; i++) {
        formData.append('files', files.item(i));
      }
      formData.append("path", path);

      this.apiRequester.multipartPost( HttpHelper.api.cloudStorage.uploadFile.uri, formData )
        .subscribe((data)=>{
          console.log("CloudStorageRequesterService >> createFolder >> data : ",data);
          observer.next(data as FileMetadataDto);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });
  }
  downloadFile(id) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.apiRequester.getFile( HttpHelper.api.cloudStorage.downloadFile.uri,
        {id : id} )
        .subscribe((data)=>{
          observer.next(data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });

  }
  renameFile(projectId, fileMetadataId, newName) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.apiRequester.patch( HttpHelper.api.cloudStorage.renameFile.uri,
        {
          projectId       : projectId,
          fileMetadataId  : fileMetadataId,
          newName         : newName,
        })
        .subscribe((data)=>{
          observer.next(data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });

  }
  deleteFile(projectId, fileMetadataId) :Observable<any>{
    return new Observable<any>((observer)=>{
      this.apiRequester.delete( HttpHelper.api.cloudStorage.deleteFile.uri,
        {
          projectId       : projectId,
          fileMetadataId  : fileMetadataId,
        })
        .subscribe((data)=>{
          observer.next(data);
        }, (error)=>{
          //console.log("ProjectRequesterService >> createProject >> error : ",error);
        });
    });

  }

}
