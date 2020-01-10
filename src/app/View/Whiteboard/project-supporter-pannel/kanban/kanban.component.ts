import { Component, OnInit } from '@angular/core';
import {PopupManagerService} from '../../../../Model/PopupManager/popup-manager.service';
import {PositionCalcService} from '../../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatDialogRef} from '@angular/material';

export class KanbanItem {
  title:string;
  userInfo;
  color:string;
  tagList:Array<TagItem>;
  constructor(title, userInfo, color){
    this.title = title;
    this.userInfo = userInfo;
    this.color = color;
    this.tagList = new Array<TagItem>();
  }
}
export class TagItem{
  title:string;
  color:string;
  constructor(title, color){
    this.title = title;
    this.color = color;
  }
}
export class KanbanGroup {
  title:string;
  scrollbarColor:string;
  kanbanItemList:Array<KanbanItem>;
  isFocused:Boolean;
  constructor(title, scrollbarColor){
    this.title = title;
    this.kanbanItemList = new Array<KanbanItem>();
    this.scrollbarColor = scrollbarColor;
    this.isFocused = false;
  }
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css','./../popup-pannel-commons.css', '../../../../../scrolling.scss']
})
export class KanbanComponent implements OnInit {

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;

  kanbanGroupWrapper:Array<KanbanGroup>;

  constructor(
    private popupManagerService:PopupManagerService,
    private posCalcService:PositionCalcService,
    public dialogRef: MatDialogRef<KanbanComponent>
  ) {
    this.kanbanGroupWrapper = new Array<KanbanGroup>();

    this.todoGroup = new KanbanGroup("TODO", "danger");
    this.inProgressGroup = new KanbanGroup("In Progress", "warning");
    this.doneGroup = new KanbanGroup("DONE", "primary");
    for(let i = 0 ; i < 12 ; i++){
      let kanbanItem = new KanbanItem("Kanban" + i, null, "red");
      this.todoGroup.kanbanItemList.push(
        kanbanItem
      );
      for(let j = 0; j < i + 1; j++){
        kanbanItem.tagList.push(
          new TagItem("hello" + (j + 1),"red")
        );

      }
    }


    this.kanbanGroupWrapper.push(this.todoGroup);
    this.kanbanGroupWrapper.push(this.inProgressGroup);
    this.kanbanGroupWrapper.push(this.doneGroup);
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


}
