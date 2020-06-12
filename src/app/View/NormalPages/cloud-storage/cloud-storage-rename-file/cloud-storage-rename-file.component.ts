import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FileMetadataDto} from '../../../../DTO/ProjectDto/FileMetadataDto/file-metadata-dto';
export class RenameCloudItemDialogData{
  fileMetadataDto:FileMetadataDto;

  constructor(fileMetadataDto: FileMetadataDto) {
    this.fileMetadataDto = fileMetadataDto;
  }
}
@Component({
  selector: 'app-cloud-storage-rename-file',
  templateUrl: './cloud-storage-rename-file.component.html',
  styleUrls: ['./cloud-storage-rename-file.component.css']
})
export class CloudStorageRenameFileComponent implements OnInit {

  newFileFormGroup:FormGroup;
  fileMetadataDto:FileMetadataDto;
  constructor(
    public dialogRef: MatDialogRef<RenameCloudItemDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: RenameCloudItemDialogData
  ) {
    this.fileMetadataDto = data.fileMetadataDto;
    this.newFileFormGroup = new FormGroup({
      title : new FormControl(this.fileMetadataDto.title, [Validators.required,]),
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
    let title = this.newFileFormGroup.get("title").value;
    console.log("CloudStorageRenameFileComponent >> onSubmit >> title : ",title);
    this.dialogRef.close({
      createFlag : true,
      title : title,
    });

  }

}
