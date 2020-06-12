import {Component, EventEmitter, Inject, OnDestroy, OnInit} from '@angular/core';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CreateCloudFolderDialogData} from '../cloud-storage-create-folder/cloud-storage-create-folder.component';
import {Subscription} from 'rxjs';

export class CloudProgressData{
  progressEventEmitter:EventEmitter<any>;
  progressMode:CloudProgressAction;
  msg;


  constructor(progressEventEmitter: EventEmitter<any>, progressMode: CloudProgressAction, msg) {
    this.progressEventEmitter = progressEventEmitter;
    this.progressMode = progressMode;
    this.msg = msg;
  }
}
export enum CloudProgressAction{
  download = "query",
  upload = "indeterminate",
}
@Component({
  selector: 'app-cloud-progress-panel',
  templateUrl: './cloud-progress-panel.component.html',
  styleUrls: [
    './cloud-progress-panel.component.css',
    '../../gachi-panel.css',
    '../../gachi-font.css',
  ]
})
export class CloudProgressPanelComponent implements OnInit {

  public fileMetadataDto:FileMetadataDto;
  public progressEventEmitter:EventEmitter<any>;
  public progressMode;
  public msg;
  constructor(
    public dialogRef: MatDialogRef<CloudProgressData>,
    @Inject(MAT_DIALOG_DATA) public data: CloudProgressData,
  ) {
    this.progressEventEmitter = data.progressEventEmitter;
    this.progressMode = data.progressMode;
    this.msg = data.msg;
    let subscription:Subscription = this.progressEventEmitter.subscribe((data)=>{
      subscription.unsubscribe();
      this.onNoClick();
    });
  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close(
      {createFlag : false}
    );
  }
}
