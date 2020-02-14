import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpHelper} from '../../../Model/Helper/http-helper/http-helper';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
  ) {
    let inviteCode = this.route.snapshot.paramMap.get('inviteCode');
    console.log("InvitationComponent >> constructor >> inviteCode : ",inviteCode);
    localStorage.setItem("inviteCode", inviteCode);
    HttpHelper.redirectTo(HttpHelper.api.authGoogle.uri);
  }

  ngOnInit() {
  }

}
