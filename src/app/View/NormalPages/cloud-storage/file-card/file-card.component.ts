import {Component, Input, OnInit} from '@angular/core';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/FileMetadataDto';
import {CloudStorageManagerService} from '../../../../Model/NormalPagesManager/cloud-storage-manager/cloud-storage-manager.service';

@Component({
  selector: 'app-file-card',
  templateUrl: './file-card.component.html',
  styleUrls: ['./file-card.component.css',
  './../../gachi-font.css']
})
export class FileCardComponent implements OnInit {
  @Input() fileMetadata:FileMetadataDto;
  constructor(
    public cloudStorageManagerService:CloudStorageManagerService
  ) { }

  ngOnInit(): void {
  }

}
