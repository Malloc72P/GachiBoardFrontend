import { Component, OnInit } from '@angular/core';
import {PointerMode, PointerModeEnumService} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {
  ProjectSupporterEnumService,
  SupportMode
} from '../../../Model/Whiteboard/ProjectSupporter/project-supporter-enum-service/project-supporter-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';

@Component({
  selector: 'app-project-supporter-pannel',
  templateUrl: './project-supporter-pannel.component.html',
  styleUrls: ['./project-supporter-pannel.component.css']
})
export class ProjectSupporterPannelComponent extends PopoverPanel  implements OnInit {
  projectSupporterEnumService: ProjectSupporterEnumService;
  constructor(
    projectSupporterEnumService: ProjectSupporterEnumService
  ) {
    super(projectSupporterEnumService);
    this.projectSupporterEnumService = projectSupporterEnumService;
  }

  ngOnInit() {
  }
  onPanelStateChangeHandler() {
    console.log("ProjectSupporterPannelComponent >> onPanelStateChangeHandler >> 진입함");
    //this.pointerModeManagerService.currentPointerMode = this.currentSelectedMode;
  }
  onClickPanelItem(panelItem: number) {
    switch (panelItem) {
      case SupportMode.KANBAN:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> KANBAN");
        break;
      case SupportMode.TIME_TIMER:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> TIME_TIMER");
        break;
      case SupportMode.CLOUD_STORAGE:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> CLOUD_STORAGE");
        break;
      case SupportMode.IMPORT:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> IMPORT");
        break;
      case SupportMode.EXPORT:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> EXPORT");
        break;
      case SupportMode.TEXT_CHAT:
        console.log("ProjectSupporterPannelComponent >> onClickPanelItem >> TEXT_CHAT");
        break;
      default:
        break;
    }
  }



}
