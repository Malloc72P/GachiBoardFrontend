import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatStepper} from '@angular/material/stepper';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {ProjectRequesterService} from '../../../../../Controller/Project/project-requester.service';
import {HttpHelper} from '../../../../../Model/Helper/http-helper/http-helper';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';

export class CreateWbSessionComponentData{
  constructor() {
  }
}

@Component({
  selector: 'app-create-wb-session',
  templateUrl: './create-wb-session.component.html',
  styleUrls: ['./create-wb-session.component.css',
    './../../../gachi-font.css','./../../../gachi-panel.css']
})
export class CreateWbSessionComponent implements OnInit {
  wbSessionFormGroup:FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateWbSessionComponentData>,
    @Inject(MAT_DIALOG_DATA) public data: CreateWbSessionComponentData
  ) {
    this.wbSessionFormGroup = new FormGroup({
      title : new FormControl("", [Validators.required,]),
    });
  }

  ngOnInit() {

  }

  onSubmit(){
    console.log("CreateWbSessionComponent >> onSubmit >> 진입함");

    let title = this.wbSessionFormGroup.get("title").value;
    let color = this.wbSessionFormGroup.get("color").value;

    this.dialogRef.close({
      createFlag : true,
    });

  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
