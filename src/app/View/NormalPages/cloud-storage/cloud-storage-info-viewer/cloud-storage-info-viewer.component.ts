import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CreateCloudFolderDialogData} from '../cloud-storage-create-folder/cloud-storage-create-folder.component';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import * as moment from 'moment';

export class FileInfoViewerData{
  fileMetadataDto:FileMetadataDto;
  mode;

  constructor(fileMetadataDto: FileMetadataDto, mode) {
    this.fileMetadataDto = fileMetadataDto;
    this.mode = mode;
  }
}
export enum FileSizeChar {
  BYTE      = "Byte",
  KILOBYTE  = "KB",
  MEGABYTE  = "MB",
  GIGABYTE  = "GB",
  TERABYTE  = "TB",
  PETABYTE  = "PB",
}

@Component({
  selector: 'app-cloud-storage-info-viewer',
  templateUrl: './cloud-storage-info-viewer.component.html',
  styleUrls: [
    './cloud-storage-info-viewer.component.css',
    '../../gachi-font.css',
    '../../gachi-panel.css',
  ]
})
export class CloudStorageInfoViewerComponent implements OnInit {
  public fileMetadataDto:FileMetadataDto;
  public mode;
  constructor(
    public dialogRef: MatDialogRef<FileInfoViewerData>,
    @Inject(MAT_DIALOG_DATA) public data: FileInfoViewerData,
  ) {
    this.fileMetadataDto = data.fileMetadataDto;
    this.mode = data.mode;
  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close(
      {createFlag : false}
    );
  }
  makeFileSizePretty(fileSize){
    let sizeStep = 0;
    let copiedFileSize = fileSize;
    for (let i = 0 ; i < 6; i++){
      if(copiedFileSize < 1024){
        break;
      }
      copiedFileSize = copiedFileSize / 1024;
      sizeStep++;
    }
    let fileSizeChar = "Byte";
    switch (sizeStep) {
      case 0 :
        fileSizeChar = FileSizeChar.BYTE;
        break;
      case 1 :
        fileSizeChar = FileSizeChar.KILOBYTE;
        break;
      case 2 :
        fileSizeChar = FileSizeChar.MEGABYTE;
        break;
      case 3 :
        fileSizeChar = FileSizeChar.GIGABYTE;
        break;
      case 4 :
        fileSizeChar = FileSizeChar.TERABYTE;
        break;
      case 5 :
        fileSizeChar = FileSizeChar.PETABYTE;
        break;
      default :
        fileSizeChar = FileSizeChar.PETABYTE;
    }
    return copiedFileSize.toFixed() + fileSizeChar;
  }
  makeDatePretty(date){
    return moment(date).format('YYYY-MM-DD hh:mm A');
  }
  isFile(){
    if(this.mode === "file"){
      return "파일"
    }
    else{
      return "폴더"
    }
  }

}
