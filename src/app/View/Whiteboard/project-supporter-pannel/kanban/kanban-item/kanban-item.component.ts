import {Component, Input, OnInit} from '@angular/core';
import {KanbanItem} from '../kanban.component';

@Component({
  selector: 'app-kanban-item',
  templateUrl: './kanban-item.component.html',
  styleUrls: ['./kanban-item.component.css']
})
export class KanbanItemComponent implements OnInit {
  @Input() kanbanItem:KanbanItem;

  constructor() { }

  ngOnInit() {
  }

}
