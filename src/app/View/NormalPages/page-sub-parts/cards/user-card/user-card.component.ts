import {Component, Input, OnInit} from '@angular/core';
import {UserDTO} from '../../../../../DTO/user-dto';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() userName;
  @Input() imgSrc;
  constructor() { }

  ngOnInit() {
  }

}
