import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {KanbanGroup} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';

import {ProjectRequesterService} from '../../../../../Controller/Project/project-requester.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export class CreateProjectComponentData{
  kanbanGroup:KanbanGroup;
}

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css',
    './../../../gachi-font.css',
    './../../../gachi-panel.css']
})
export class CreateProjectComponent implements OnInit {
  @ViewChild('projectCreateForm') formEl: ElementRef<HTMLFormElement>;

  projectFormGroup:FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateProjectComponentData>,
    public authRequestService:AuthRequestService,
    public projectRequesterService:ProjectRequesterService,

    @Inject(MAT_DIALOG_DATA) public data: CreateProjectComponentData
  ) {
    this.projectFormGroup = new FormGroup({
      projectTitle: new FormControl("", [Validators.required,]),
    });

  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(){

    let projectTitle = this.projectFormGroup.get("projectTitle").value;
    let userDto = this.authRequestService.getUserInfo();

    this.projectRequesterService.createProject(projectTitle)
      .subscribe((data:ProjectDto)=>{
        console.log("CreateProjectComponent >> onSubmit >> data : ",data);
        this.dialogRef.close({
          projectDto : data,
        });

      });
  }


}
