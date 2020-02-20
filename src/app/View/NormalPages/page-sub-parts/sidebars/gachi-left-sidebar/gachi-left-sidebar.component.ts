import {Component, OnInit, ViewChild} from '@angular/core';
import {
  GachiSidebarEvent,
  GachiSidebarEventEnum
} from '../../../../../Model/NormalPagesManager/gachi-sidebar-manager/GachiSidebarEvent/GachiSidebarEvent';
import {GachiSidebarManagerService} from '../../../../../Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';

@Component({
  selector: 'app-gachi-left-sidebar',
  templateUrl: './gachi-left-sidebar.component.html',
  styleUrls: ['./gachi-left-sidebar.component.css', './../../../gachi-font.css']
})
export class GachiLeftSidebarComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {

  }

}
