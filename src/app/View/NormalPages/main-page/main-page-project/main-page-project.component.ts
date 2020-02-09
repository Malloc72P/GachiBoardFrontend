import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {KanbanItemColor} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {KanbanTagListManagerService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {UserManagerService} from '../../../../Model/UserManager/user-manager.service';
import {KanbanComponent} from '../../../Whiteboard/project-supporter-pannel/kanban/kanban.component';
import {MatDialog} from '@angular/material';
import {PositionCalcService} from '../../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';

@Component({
  selector: 'app-main-page-project',
  templateUrl: './main-page-project.component.html',
  styleUrls: ['./main-page-project.component.css',
    './../main-article-style.css',
    './../../gachi-font.css',
    './../../../Whiteboard/project-supporter-pannel/project-supporter-pannel.component.css',
    './../../../Whiteboard/project-supporter-pannel/popup-pannel-commons.css']
})
export class MainPageProjectComponent implements OnInit {
  private projectId = "";

  todoGroup:KanbanGroup;
  inProgressGroup:KanbanGroup;
  doneGroup:KanbanGroup;

  kanbanGroups: Array<KanbanGroup>;
  constructor(
    private route: ActivatedRoute,
    private tagListMgrService:KanbanTagListManagerService,
    private userManagerService:UserManagerService,
    private htmlHelperService:HtmlHelperService,
    public dialog: MatDialog,
  ) {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    this.kanbanGroups = new Array<KanbanGroup>();

    this.inProgressGroup = new KanbanGroup("In Progress", "accent");
    let userInfo = this.userManagerService.getUserList()[0];

    let kanbanItem = new KanbanItem("네오스틸 판금장갑 경량화", userInfo, KanbanItemColor.RED);
    tagListMgrService.insertTagInTaglist(kanbanItem, "Start=01.05", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "예산부족", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "예산 추가신청중", "red");
    this.inProgressGroup.kanbanItemList.push(kanbanItem);

    kanbanItem = new KanbanItem("숄더 로켓셀보 플랫폼 소형화", userInfo, KanbanItemColor.BLACK);
    tagListMgrService.insertTagInTaglist(kanbanItem, "Start=01.15", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "로켓 안전장치 완료", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "신형 추진체 개발중", "red");
    this.inProgressGroup.kanbanItemList.push(kanbanItem);

    kanbanItem = new KanbanItem("테르밋 블레이드용 축전지 개량", userInfo, KanbanItemColor.BLUE);
    tagListMgrService.insertTagInTaglist(kanbanItem, "Start=02.13", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "축전지 지속시간 개량성공", "red");
    tagListMgrService.insertTagInTaglist(kanbanItem, "축전지 충격 수용성 개량중", "red");
    this.inProgressGroup.kanbanItemList.push(kanbanItem);



    this.kanbanGroups.push(this.inProgressGroup);
  }

  ngOnInit() {
  }

  openKanbanPanel(kanbanObject){
    console.log("MainPageProjectComponent >> openKanbanPanel >> kanbanObject : ",kanbanObject);

    console.log("MainPageProjectComponent >> openKanbanPanel >> this.htmlHelperService.getWidthOfBrowser() : ",this.htmlHelperService.getWidthOfBrowser());

    const dialogRef = this.dialog.open(KanbanComponent, {
      width: this.htmlHelperService.getWidthOfBrowser()+"px",
      height: this.htmlHelperService.getHeightOfBrowser()+"px",
      maxWidth: this.htmlHelperService.getWidthOfBrowser()+"px",
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }


}
