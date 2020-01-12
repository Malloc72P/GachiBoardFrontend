import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserManagerService} from '../../../../../Model/UserManager/user-manager.service';
import {FormControl, Validators} from '@angular/forms';
import {
  KanbanItemColorService
} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';

export class EditKanbanDialogData {
  kanbanItem:KanbanItem;
}

@Component({
  selector: 'app-kanban-item-edit',
  templateUrl: './kanban-item-edit.component.html',
  styleUrls: ['./kanban-item-edit.component.css']
})
export class KanbanItemEditComponent implements OnInit {
  kanbanItem:KanbanItem;
  userFormControl:FormControl;
  colorFormControl:FormControl;
  titleFormControl:FormControl;

  selected = 0;
  constructor(
    public dialogRef: MatDialogRef<KanbanItemEditComponent>,
    private userManagerService:UserManagerService,
    private colorService:KanbanItemColorService,
    @Inject(MAT_DIALOG_DATA) public data: EditKanbanDialogData) {
    this.kanbanItem = data.kanbanItem;

    this.titleFormControl = new FormControl(this.kanbanItem.title, [
      Validators.required,
    ]);
    this.colorFormControl = new FormControl(this.kanbanItem.getColorNumber());
    this.userFormControl = new FormControl(this.kanbanItem.userInfo.name);
    console.log("KanbanItemEditComponent >> constructor >> colorService : ",colorService.getEnumEntryArray());
    console.log("KanbanItemEditComponent >> constructor >> colorFormControl : ",this.colorFormControl.value);
    this.selected = this.colorFormControl.value;
  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(){
    this.kanbanItem.userInfo = this.userManagerService.getUserDataByName(
      this.userFormControl.value
    );
    this.kanbanItem.setColor(this.colorFormControl.value);
    this.kanbanItem.title = this.titleFormControl.value;
    this.dialogRef.close({
      kanbanItem : this.kanbanItem
    })
  }
  onResetClick(){
    this.userFormControl.setValue(this.kanbanItem.userInfo.name);
    this.titleFormControl.setValue(this.kanbanItem.title);
  }

}
