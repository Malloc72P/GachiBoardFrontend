import {Component, Inject, OnInit} from '@angular/core';

import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanItemColorService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AreYouSurePanelService} from '../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

class KanbanGroupSettingDialogData {
  groups: Array<KanbanGroup>;
}

@Component({
  selector: 'app-kanban-group-setting',
  templateUrl: './kanban-group-setting.component.html',
  styleUrls: ['./kanban-group-setting.component.css', '../../../../../scrolling.scss']
})
export class KanbanGroupSettingComponent implements OnInit {
  kanbanGroups: Array<KanbanGroup>;
  kanbanGroupsFormGroup: FormGroup;
  prevKanbanGroupSize = 0;
  public onSubmitFlag = true;

  constructor(
    public dialogRef: MatDialogRef<KanbanGroupSettingComponent>,
    public userManagerService: UserManagerService,
    public colorService: KanbanItemColorService,
    public areYouSurePanelService: AreYouSurePanelService,
    public htmlHelperService: HtmlHelperService,
    @Inject(MAT_DIALOG_DATA) public data: KanbanGroupSettingDialogData,
  ) {
    this.kanbanGroups = new Array<KanbanGroup>();
    this.prevKanbanGroupSize = data.groups.length;
    for (let i = 0; i < data.groups.length; i++) {
      let currentGroup = data.groups[i];
      let tempGroup = new KanbanGroup(currentGroup.title, currentGroup.groupColor);
      this.kanbanGroups.push(tempGroup);
    }
    console.log('KanbanGroupSettingComponent >> constructor >> kanbanGroups : ', this.kanbanGroups);

    this.kanbanGroupsFormGroup = new FormGroup({});

    for (let i = 0; i < this.kanbanGroups.length; i++) {
      this.addControl(i);
    }
    console.log('KanbanGroupSettingComponent >> constructor >> kanbanGroupsFormGroup : ', this.kanbanGroupsFormGroup);
  }

  ngOnInit() {
  }

  onNoClick(): void {
    console.log("KanbanGroupSettingComponent >> onNoClick >> 진입함");
    this.onSubmitFlag = false;
    this.dialogRef.close();
  }

  onSubmit() {
    if(!this.onSubmitFlag){
      return;
    }
    console.log("KanbanGroupSettingComponent >> onSubmit >> 진입함");
    console.log("KanbanGroupSettingComponent >> onSubmit >> kanbanGroupsFormGroup : ",this.kanbanGroupsFormGroup);
    this.areYouSurePanelService.openAreYouSurePanel(
      '정말로 적용하시겠습니까?',
      '해당 작업은 되돌릴 수 없습니다.')
      .subscribe((result) => {
        console.log('KanbanGroupSettingComponent >> areYouSure >> result : ', result);
        if (result) {//확인응답 패널에서 확인버튼 누른 경우
          let groupsRef = this.data.groups;
          console.log("KanbanGroupSettingComponent >>  >> kanbanGroupsFormGroup : ",this.kanbanGroupsFormGroup);
          //Step-1 : 일단 수정된 내용 반영하고, 추가된 그룹 반영함
          for (let i = 0; i < this.kanbanGroups.length; i++) {
            console.log('KanbanGroupSettingComponent >> onSubmit >> i : ', i);
            let currentGroup = this.kanbanGroups[i];
            let realGroupRef = groupsRef[i];

            let title = this.kanbanGroupsFormGroup.get('title-' + i).value;
            let groupColor = this.kanbanGroupsFormGroup.get('groupColor-' + i).value;
            let isRemoved = this.kanbanGroupsFormGroup.get('isRemoved-' + i).value;

            if (isRemoved) {//삭제된 칸반인 경우
              //groupsRef.splice(i, 1);
            } else {//삭제된 칸반이 아닌 경우
              if (i >= this.prevKanbanGroupSize) {
                groupsRef.splice(groupsRef.length, 0,
                  new KanbanGroup(title,groupColor));
              }
              else{
                realGroupRef.title = title;
                realGroupRef.groupColor = groupColor;
              }
            }
          }//for
          //Step-2 : 삭제예정인 그룹을 삭제함
          for (let i = 0; i < this.kanbanGroups.length; i++) {
            let isRemoved = this.kanbanGroupsFormGroup.get('isRemoved-' + i).value;
            if (isRemoved) {
              groupsRef.splice(i, 1);
            }
          }
          this.dialogRef.close();
        } else {//확인응답 패널에서 취소버튼 누른 경우

        }
      });
  }

  addGroup() {
    let newGroup = new KanbanGroup('newGroup', 'primary');
    this.kanbanGroups.push(newGroup);
    console.log('KanbanGroupSettingComponent >> addGroup >> kanbanGroups : ', this.kanbanGroups);
    let i = this.kanbanGroups.length;
    this.addControl(i-1);
  }

  addControl(i) {
    console.log("KanbanGroupSettingComponent >> addControl >> i : ",i);
    this.kanbanGroupsFormGroup.addControl(
      'isRemoved-' + i,
      new FormControl(false)
    );
    this.kanbanGroupsFormGroup.addControl(
      'title-' + i,
      new FormControl(this.kanbanGroups[i].title, [Validators.required,])
    );
    this.kanbanGroupsFormGroup.addControl(
      'groupColor-' + i,
      new FormControl(this.kanbanGroups[i].groupColor)
    );
  }


}
