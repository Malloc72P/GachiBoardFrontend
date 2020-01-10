import {Component, OnInit, Renderer2} from '@angular/core';
import {PointerMode, PointerModeEnumService} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {
  ProjectSupporterEnumService,
  SupportMode
} from '../../../Model/Whiteboard/ProjectSupporter/project-supporter-enum-service/project-supporter-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';
import {PositionCalcService} from '../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {PopupManagerService} from '../../../Model/PopupManager/popup-manager.service';
import {KanbanComponent} from './kanban/kanban.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-project-supporter-pannel',
  templateUrl: './project-supporter-pannel.component.html',
  styleUrls: ['./project-supporter-pannel.component.css',  './popup-pannel-commons.css']
})
export class ProjectSupporterPannelComponent extends PopoverPanel  implements OnInit {
  projectSupporterEnumService: ProjectSupporterEnumService;
  isHovered;
  private prevPopup = null;
  constructor(
    projectSupporterEnumService: ProjectSupporterEnumService,
    posCalcService :PositionCalcService,
    private renderer2:Renderer2,
    private popupManagerService:PopupManagerService,
    public dialog: MatDialog,
    private positionCalcService:PositionCalcService
  ) {
    super(projectSupporterEnumService);
    this.projectSupporterEnumService = projectSupporterEnumService;
    this.isHovered = new Array<Boolean>(this.selectableMode.length);
    for(let i = 0 ; i < this.selectableMode.length; i++){
      this.isHovered[i] = false;
    }
  }

  ngOnInit() {
    this.popupManagerService.getEventEmitter()
      .subscribe(()=>{
        if(this.prevPopup){
          this.renderer2.removeClass(this.prevPopup, "do-anime-popup-appear");
          this.renderer2.addClass(this.prevPopup,"do-anime-popup-disappear");
          this.prevPopup = null;
        }
      })

  }
  onPanelStateChangeHandler() {
    console.log("ProjectSupporterPannelComponent >> onPanelStateChangeHandler >> 진입함");
    //this.pointerModeManagerService.currentPointerMode = this.currentSelectedMode;
  }
  onClickPanelItem(panelItem: number) {
    console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> this.prevPopup : ",this.prevPopup);
    /*if(this.prevPopup){
      this.renderer2.removeClass(this.prevPopup, "do-anime-popup-appear");
      this.renderer2.addClass(this.prevPopup,"do-anime-popup-disappear");
    }
    let itemName = this.projectSupporterEnumService.getEnumArray()[panelItem];
    let itemElement:HTMLElement = document.getElementById("supporter-" + itemName) as HTMLElement;
    if(!itemElement){
      return;
    }
    this.renderer2.removeClass(itemElement, "do-anime-popup-disappear");
    this.renderer2.addClass(itemElement,"do-anime-popup-appear");
    this.prevPopup = itemElement;*/

    const dialogRef = this.dialog.open(KanbanComponent, {
      width: this.positionCalcService.getWidthOfBrowser()+"px",
      height: this.positionCalcService.getHeightOfBrowser()+"px",
      maxWidth: this.positionCalcService.getWidthOfBrowser()+"px",
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }



}
