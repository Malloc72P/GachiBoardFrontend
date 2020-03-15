import {Component, OnInit} from '@angular/core';
import {VideoChatPanelManagerService} from "../../../../Model/Whiteboard/VideoChat/video-chat-panel-manager/video-chat-panel-manager.service";
import {PanelData} from "../PanelData/panel-data";

@Component({
  selector: 'app-video-chat-panel',
  templateUrl: './video-chat-panel.component.html',
  styleUrls: ['./video-chat-panel.component.css']
})
export class VideoChatPanelComponent implements OnInit {
  constructor(
    private panelManager: VideoChatPanelManagerService,
  ) {
  }

  ngOnInit(): void {
  }

  get panels(): Array<PanelData> {
    return Array.from(this.panelManager.videoPanels.values());
  }

  get PanelManager(): VideoChatPanelManagerService {
    return this.panelManager;
  }
}
