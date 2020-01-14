import {Component, OnInit} from '@angular/core';
import {PopupManagerService} from '../../../../Model/PopupManager/popup-manager.service';
import {PositionCalcService} from '../../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatDialog, MatDialogRef} from '@angular/material';
import {KanbanTagListManagerService,TagItem
} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {KanbanItemEditComponent} from './kanban-item-edit/kanban-item-edit.component';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanItemColor} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanItemCreateComponent} from './kanban-item-create/kanban-item-create.component';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanGroupSettingComponent} from './kanban-group-setting/kanban-group-setting.component';
import {KanbanTagManagementComponent} from './kanban-tag-management/kanban-tag-management.component';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css',
    './../popup-pannel-commons.css',
    '../../../../../scrolling.scss',
    '../../project-supporter-pannel/project-supporter-pannel.component.css']
})
export class KanbanComponent implements OnInit {

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;
  isDragging:Boolean = false;

  kanbanGroupWrapper:Array<KanbanGroup>;

  constructor(
    private popupManagerService:PopupManagerService,
    private posCalcService:PositionCalcService,
    public dialogRef: MatDialogRef<KanbanComponent>,
    private tagListMgrService:KanbanTagListManagerService,
    private userManagerService:UserManagerService,
    public dialog: MatDialog
  ) {
    this.kanbanGroupWrapper = new Array<KanbanGroup>();

    this.todoGroup = new KanbanGroup("TODO", "primary");
    this.inProgressGroup = new KanbanGroup("In Progress", "accent");
    this.doneGroup = new KanbanGroup("DONE", "warn");
    for(let i = 0 ; i < 24 ; i++){
      let kanbanItem = new KanbanItem("Kanban" + i, null, KanbanItemColor.RED);
      kanbanItem.userInfo = this.userManagerService.getUserList()[0];
      this.addTo(kanbanItem, this.todoGroup);
      for(let j = 0; j < i + 1; j++){
        tagListMgrService.insertTagInTaglist(kanbanItem, "tag"+j, "red");
      }
    }


    this.kanbanGroupWrapper.push(this.todoGroup);
    this.kanbanGroupWrapper.push(this.inProgressGroup);
    this.kanbanGroupWrapper.push(this.doneGroup);
  }

  addTo(kanbanItem:KanbanItem, kanbanGroup:KanbanGroup){
    kanbanGroup.kanbanItemList.push(kanbanItem)
  }
  enqueueTo(kanbanItem:KanbanItem, kanbanGroup:KanbanGroup){
    kanbanGroup.kanbanItemList.splice(0, 0, kanbanItem);
  }
  deleteFrom(kanbanItem:KanbanItem, kanbanGroup:KanbanGroup){
    let index = -1;
    index = kanbanGroup.kanbanItemList.indexOf(kanbanItem);
    if(index >= 0){
      kanbanGroup.kanbanItemList.splice(index, 1);
    }
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log("KanbanComponent >> drop >> 진입함");
    if (event.previousContainer === event.container) {
      console.log("KanbanComponent >> drop >> 이전 컨테이너와 현재 컨네이너가 동일");
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("KanbanComponent >> drop >> 이전과 현재 컨테이너가 다름.");
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onEditBtnClick(item){
    const dialogRef = this.dialog.open(KanbanItemEditComponent, {
      width: '480px',
      data: {kanbanItem: item}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });
  }
  onCreateItem(group){
    const dialogRef = this.dialog.open(KanbanItemCreateComponent, {
      width: '480px',
      data: {kanbanGroup: group}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
      this.enqueueTo(result.kanbanItem, result.kanbanGroup);
    });

  }
  onKanbanGroupSetting(){
    const dialogRef = this.dialog.open(KanbanGroupSettingComponent, {
      width: '480px',
      data: {groups: this.kanbanGroupWrapper}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });

  }
  onTagManagement(){
    const dialogRef = this.dialog.open(KanbanTagManagementComponent, {
      width: '540px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("KanbanComponent >>  >> result : ",result);
    });

  }


}
