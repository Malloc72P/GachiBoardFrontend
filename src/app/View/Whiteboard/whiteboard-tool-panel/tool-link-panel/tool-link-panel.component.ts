import * as paper from "paper";
// @ts-ignore
import Color = paper.Color;

import {Component, OnInit} from '@angular/core';
import {EditableLinkCapTypes} from "../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";
import {SubPanelManager} from "../../../../Model/Whiteboard/Panel/sub-panel-manager/sub-panel-manager";
import {LinkService} from "../../../../Model/Whiteboard/Pointer/link-service/link.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

enum SelectMode {
  TAIL,
  LINE,
  HEAD,
}

@Component({
  selector: 'app-tool-link-panel',
  templateUrl: './tool-link-panel.component.html',
  styleUrls: ['./tool-link-panel.component.css']
})
export class ToolLinkPanelComponent implements OnInit {
  public colors = [
    new paper.Color(0, 0, 0),
    new paper.Color(255, 0, 0),
    new paper.Color(0, 255, 0),
    new paper.Color(0, 0, 255),
  ];

  private _currentMode: SelectMode = SelectMode.LINE;
  private _subPanel: SubPanelManager;

  public linkStyle: FormGroup;

  constructor(
    public linkService: LinkService,
    public formBuilder: FormBuilder,
  ) {
    this.linkStyle = formBuilder.group({
      capSize: [10, [Validators.min(10), Validators.max(50)]],
    });
  }

  ngOnInit(): void {
    this._subPanel = new SubPanelManager([
      SelectMode.TAIL,
      SelectMode.LINE,
      SelectMode.HEAD,
    ]);
    this._subPanel.revealThis(SelectMode.LINE);
  }

  public colorSelected(index: number) {
    if(this.colors[index].equals(this.linkService.linkColor)) {
      return "selected";
    }
    return "";
  }

  public colorToHtml(color: Color) {
    return color.toCSS(false);
  }

  public currentMode(mode: SelectMode): boolean {
    return mode === this._currentMode;
  }

  public onClickModeSelector(mode: SelectMode) {
    this._currentMode = mode;
    this._subPanel.hideOther(mode);
    this._subPanel.revealThis(mode);
  }

  public onClickHeadSelector(type: string) {
    this.linkService.linkHeadType = EditableLinkCapTypes[type];
  }

  public onClickTailSelector(type: string) {
    this.linkService.linkTailType = EditableLinkCapTypes[type];
  }

  public onChangeColorSelector(color: Color) {
    this.linkService.linkColor = color;
  }

  public svgReflection(mode: SelectMode) {
    if(mode === SelectMode.TAIL) {
      return "transform: scaleX(-1)";
    }
    return "";
  }

  get ModeArray(): Array<string> {
    return [
      this.currentLinkTail,
      this.currentLinkLine,
      this.currentLinkHead,
    ];
  }

  get LinkArray(): Array<string> {
    return [
      "NONE",
      "ARROW",
    ];
  }

  get currentLinkHead(): string {
    return EditableLinkCapTypes[this.linkService.linkHeadType];
  }

  get currentLinkTail(): string {
    return EditableLinkCapTypes[this.linkService.linkTailType];
  }

  get currentLinkLine(): string {
    if(this.linkService.isDashed) {
      return "DASHED";
    }
    return "NONE";
  }

  get SelectMode() {
    return SelectMode;
  }

  get subPanel(): SubPanelManager {
    return this._subPanel;
  }

  get linkColor(): string {
    return this.linkService.linkColor.toCSS(true);
  }
}
