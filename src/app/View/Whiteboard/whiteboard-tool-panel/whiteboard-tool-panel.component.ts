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
  constructor(
    public pointerModeEnumService: PointerModeEnumService,
    public pointerModeManagerService: PointerModeManagerService,
    public panelManager: PanelManagerService,
    public layerService: DrawingLayerManagerService,
  ) {
    super(pointerModeEnumService);
    this.pointerModeEnumService = pointerModeEnumService;
  }

  ngOnInit() {
    this.outsideClickListener();
    //this.modeChange(PointerMode.POINTER);
    this.layerService.pointerModeEventEmitter.subscribe((data:PointerModeEvent)=>{

    })
  }

  private outsideClickListener() {
    document.addEventListener("mousedown", (event) => {
      this.onClickOutsidePanel(event);
    });
    document.addEventListener("touchstart", (event) => {
      this.onClickOutsidePanel(event);
    });
  }

  private onClickOutsidePanel(event) {
    let HTMLToolPanel = document.getElementById("toolPanel");
    let HTMLBrushPanel = document.getElementById("brushPanel");
    let HTMLHighLighterPanel = document.getElementById("highlighterPanel");
    let HTMLLinkPanel = document.getElementById("linkPanel");
    let HTMLShapePanel = document.getElementById("shapePanel");

    // ToolPanel 이나 BrushPanel 을 누르지 않은경우 BrushPanel 숨김
    if(!(HTMLToolPanel.contains(event.target) || HTMLBrushPanel.contains(event.target))) {
      this.panelManager.subPanel.hideThis(PointerMode.DRAW);
    }
    // ToolPanel 이나 HighLighterPanel 을 누르지 않은경우 HighLighterPanel 숨김
    if (!(HTMLToolPanel.contains(event.target) || HTMLHighLighterPanel.contains(event.target))) {
      this.panelManager.subPanel.hideThis(PointerMode.HIGHLIGHTER);
    }
    // ToolPanel 이나 LinkPanel 을 누르지 않은경우 LinkPanel 숨김
    if (!(HTMLToolPanel.contains(event.target) || HTMLLinkPanel.contains(event.target))) {
      this.panelManager.subPanel.hideThis(PointerMode.LINK);
    }
    // ToolPanel 이나 ShapePanel 을 누르지 않은경우 ShapePanel 숨김
    if (!(HTMLToolPanel.contains(event.target) || HTMLShapePanel.contains(event.target))) {
      this.panelManager.subPanel.hideThis(PointerMode.SHAPE);
    }
  }

  get PointerModeEnum() {
    return PointerMode;
  }
}
