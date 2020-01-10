import { Component, OnInit } from '@angular/core';
import {PopupManagerService} from '../../../../Model/PopupManager/popup-manager.service';
import {PositionCalcService} from '../../../../Model/Whiteboard/PositionCalc/position-calc.service';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css','./../popup-pannel-commons.css']
})
export class KanbanComponent implements OnInit {
  private kanbanCellArray;
  private testArray;
  constructor(
    private popupManagerService:PopupManagerService,
    private posCalcService:PositionCalcService
  ) {
    this.kanbanCellArray = new Array<String>();
    this.kanbanCellArray.push("TODO");
    this.kanbanCellArray.push("In Progress");
    this.kanbanCellArray.push("Done");

    this.testArray = new Array<String>();
    for(let i = 0 ; i < 6 ; i++ ){
      this.testArray.push("a");
    }
  }

  ngOnInit() {
  }


}
