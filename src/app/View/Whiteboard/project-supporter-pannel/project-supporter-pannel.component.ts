import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {
  ProjectSupporterEnumService,
  SupportMode
} from '../../../Model/Whiteboard/ProjectSupporter/project-supporter-enum-service/project-supporter-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';
import {PositionCalcService} from '../../../Model/Whiteboard/PositionCalc/position-calc.service';
import {PopupManagerService} from '../../../Model/PopupManager/popup-manager.service';
import {KanbanComponent} from '../../NormalPages/kanban/kanban.component';
import {ImportFileService} from "../../../Model/Whiteboard/ImportFile/import-file.service";
import {CursorTrackerService} from "../../../Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service";
import {DrawingLayerManagerService} from "../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {MatDialog} from '@angular/material/dialog';
import {HotKeyManagementService} from '../../../Model/Whiteboard/HotKeyManagement/hot-key-management.service';
import {VideoChatService} from "../../../Model/Whiteboard/VideoChat/video-chat/video-chat.service";
import {MatMenu} from "@angular/material/menu";

@Component({
  selector: 'app-project-supporter-pannel',
  templateUrl: './project-supporter-pannel.component.html',
  styleUrls: ['./project-supporter-pannel.component.css',  '../../NormalPages/popup-pannel-commons.css']
})
export class ProjectSupporterPannelComponent extends PopoverPanel  implements OnInit {
  @ViewChild('fileInputMultiple') fileInputMultiple: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('videoChatMenu', {static: true}) videoChatMenu: MatMenu;
  projectSupporterEnumService: ProjectSupporterEnumService;
  isHovered;
  public prevPopup = null;
  constructor(
    projectSupporterEnumService: ProjectSupporterEnumService,
    posCalcService :PositionCalcService,
    public renderer2:Renderer2,
    public popupManagerService:PopupManagerService,
    public dialog: MatDialog,
    public positionCalcService:PositionCalcService,
    public importFileService: ImportFileService,
    public cursorTrackerService: CursorTrackerService,
    public layerService: DrawingLayerManagerService,
    public hotKeyManagementService: HotKeyManagementService,
    private videoChat: VideoChatService,
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
    switch (panelItem) {
      case SupportMode.KANBAN:

        this.hotKeyManagementService.disableHotKeySystem();

        const dialogRef = this.dialog.open(KanbanComponent, {
          width: this.positionCalcService.getWidthOfBrowser()+"px",
          height: this.positionCalcService.getHeightOfBrowser()+"px",
          maxWidth: this.positionCalcService.getWidthOfBrowser()+"px",
          data: {}
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          this.hotKeyManagementService.enableHotKeySystem();
        });
        break;
      case SupportMode.TIME_TIMER:
        break;
      case SupportMode.CLOUD_STORAGE:
        break;
      case SupportMode.IMPORT:
        document.getElementById("fileInputMultiple").click();
        break;
      case SupportMode.EXPORT:
        break;
      case SupportMode.TEXT_CHAT:
        break;
      case SupportMode.VIDEO_CHAT:
        break;
      case SupportMode.CURSOR_TRACKER:
        if(this.cursorTrackerService.isActivate) {
          this.cursorTrackerService.off();
        } else {
          this.cursorTrackerService.on();
        }
        break;
      default:
        break;
    }
  }

  onFileChangeMultiple() {
    let fileObjects = this.fileInputMultiple.nativeElement.files;
    console.log("ProjectSupporterPannelComponent >> onFileChange >> this.fileInput.nativeElement.files : ", fileObjects);

    this.importFileService.importFile(fileObjects)
  }

  onFileChange() {
    let fileObject = this.fileInput.nativeElement.files;

    this.importFileService.importFile(fileObject)
  }

  onClickCam() {
    if(this.videoChat.isJoined) {
      this.videoChat.changeVideoSource('cam').then();
    } else {
      this.videoChat.joinVideoChat('cam').then();
    }
  }

  onClickScreen() {
    if(this.videoChat.isJoined) {
      this.videoChat.changeVideoSource('screen').then()
    } else {
      this.videoChat.joinVideoChat('screen').then();
    }
  }

  onClickEnd() {
    this.videoChat.leaveVideoChat().then();
  }

  menu(mode: SupportMode) {
    if(mode === SupportMode.VIDEO_CHAT) {
      return this.videoChatMenu;
    }
    return undefined;
  }

  get disableCam(): boolean {
    if(this.videoChat.isJoined) {
      return this.videoChat.isCam;
    }
    return false;
  }

  get disableEnd(): boolean {
    return !this.videoChat.isJoined;

  }

  get screenState(): string {
    if(this.videoChat.isJoined) {
      return "Change screen";
    } else {
      return "Broadcast screen";
    }
  }

  get SupportMode() {
    return SupportMode;
  }
}
