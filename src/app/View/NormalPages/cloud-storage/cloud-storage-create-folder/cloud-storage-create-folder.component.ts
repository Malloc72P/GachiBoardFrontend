import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';


export class CreateCloudFolderDialogData{
  fileMetadataDto:FileMetadataDto
}

@Component({
  selector: 'app-cloud-storage-create-folder',
  templateUrl: './cloud-storage-create-folder.component.html',
  styleUrls: ['./cloud-storage-create-folder.component.css']
})
export class CloudStorageCreateFolderComponent implements OnInit {
  folderCreateFormGroup:FormGroup;
  constructor(
    public dialogRef: MatDialogRef<CreateCloudFolderDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: CreateCloudFolderDialogData
  ) {

    this.folderCreateFormGroup = new FormGroup({
      title : new FormControl("", [Validators.required,]),
    });
  }


  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close(
      {createFlag : false}
    );
  }

  onSubmit(){
    let title = this.folderCreateFormGroup.get("title").value;
    console.log("CloudStorageCreateFolderComponent >> onSubmit >> title : ",title);
    this.dialogRef.close({
      createFlag : true,
      title : title,
    });

  }

}
