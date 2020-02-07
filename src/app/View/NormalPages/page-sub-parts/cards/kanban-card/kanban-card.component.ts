import {Component, Input, OnInit} from '@angular/core';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';

@Component({
  selector: 'app-kanban-card',
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.css', './../../../gachi-font.css']
})
export class KanbanCardComponent implements OnInit {
  @Input() kanbanItem:KanbanItem;
  constructor() { }

  ngOnInit() {
  }

}
