import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanItemColorService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export class CreateKanbanDialogData{
  kanbanGroup:KanbanGroup;
}

@Component({
  selector: 'app-kanban-item-create',
  templateUrl: './kanban-item-create.component.html',
  styleUrls: ['./kanban-item-create.component.css']
})
export class KanbanItemCreateComponent implements OnInit {
  @ViewChild('kanbanCreateForm') formEl: ElementRef<HTMLFormElement>;

  kanbanGroup:KanbanGroup;
  kanbanCreateFormGroup:FormGroup;

  constructor(
    public dialogRef: MatDialogRef<KanbanItemCreateComponent>,
    public userManagerService:UserManagerService,
    public colorService:KanbanItemColorService,
    @Inject(MAT_DIALOG_DATA) public data: CreateKanbanDialogData
  ) {
    //console.log("KanbanItemCreateComponent >> constructor >> data : ",data.kanbanGroup.title);
    this.kanbanGroup = data.kanbanGroup;

    this.kanbanCreateFormGroup = new FormGroup({
      title : new FormControl("", [Validators.required,]),
      color : new FormControl("0"),
      user  : new FormControl("", [Validators.required,])
    });
  }

  ngOnInit() {
  }
  onNoClick(): void {
    this.dialogRef.close(
      {createFlag : false}
    );
  }
  onSubmit(){
    //console.log("KanbanItemCreateComponent >> onSubmit >> 진입함");
    let title = this.kanbanCreateFormGroup.get("title").value;
    let userInfo = this.userManagerService.getUserDataByName(this.kanbanCreateFormGroup.get("user").value);
    let color = this.kanbanCreateFormGroup.get("color").value;

    let kanbanItem = new KanbanItem(title, userInfo, color);
    //console.log("KanbanItemCreateComponent >> onSubmit >> kanbanItem : ",kanbanItem);
    this.dialogRef.close({
      createFlag : true,
      kanbanItem : kanbanItem,
      kanbanGroup : this.kanbanGroup
    });

  }
}
