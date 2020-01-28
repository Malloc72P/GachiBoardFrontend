import {Component, OnInit} from '@angular/core';
import {PointerMode, PointerModeEnumService} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {DrawingLayerManagerService} from '../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PointerModeEvent} from '../../../Model/Whiteboard/Pointer/PointerModeEvent/pointer-mode-event';

@Component({
  selector: 'app-whiteboard-tool-panel',
  templateUrl: './whiteboard-tool-panel.component.html',
  styleUrls: ['./whiteboard-tool-panel.component.css']
})
export class WhiteboardToolPanelComponent extends PopoverPanel implements OnInit {
  private toolPanelToggleGroupValue;

  constructor(
    private pointerModeEnumService: PointerModeEnumService,
    public pointerModeManagerService: PointerModeManagerService,
    private panelManager: PanelManagerService,
    private layerService: DrawingLayerManagerService,
  ) {
    super(pointerModeEnumService);
    this.pointerModeEnumService = pointerModeEnumService;
  }

  ngOnInit() {
    this.panelManager.brushPanelOutsideClickListener();
    //this.modeChange(PointerMode.POINTER);
    this.layerService.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{

    })
  }



  get PointerModeEnum() {
    return PointerMode;
  }
}
