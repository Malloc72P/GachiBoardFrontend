import {Component, Input, OnInit} from '@angular/core';
import {UserDTO} from '../../../../../DTO/user-dto';
import {ParticipantDto} from '../../../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {HtmlHelperService} from '../../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {
  @Input() imgSrc;
  @Input() participantDto:ParticipantDto;
  constructor(
    public htmlHelper:HtmlHelperService
  ) { }

  ngOnInit() {
  }

}
