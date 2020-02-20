import {WebsocketPacketDto} from '../../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';

export class NotVerifiedKanbanItem {
  wsPacketDto:WebsocketPacketDto;
  kanbanItem:KanbanItem;

  constructor(wsPacketDto: WebsocketPacketDto, kanbanItem: KanbanItem) {
    this.wsPacketDto = wsPacketDto;
    this.kanbanItem = kanbanItem;
  }
}
