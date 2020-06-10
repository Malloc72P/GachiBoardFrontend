import {Component, Input, OnInit} from '@angular/core';

import {CloudStorageManagerService} from '../../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';
import {FileMetadataDto, FileTypeEnum} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.css',
  './../../gachi-font.css']
})
export class FileCardComponent implements OnInit {
  @Input() fileMetadata:FileMetadataDto;
  @Input() currDirectory:FileMetadataDto;
  constructor(
    public cloudStorageManagerService:CloudStorageManagerService,
  ) { }

  ngOnInit(): void {
  }
  isZipFile(){
    // console.log("FileCardComponent >> isZipFile >> fileMetadata : ",this.fileMetadata.type);
    return this.fileMetadata.type === FileTypeEnum.COMPRESSED_FILE;
  }
  isDirectory(){
    return this.fileMetadata.type === FileTypeEnum.DIRECTORY;
  }

}
