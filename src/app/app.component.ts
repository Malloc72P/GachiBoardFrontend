import {Component, OnInit} from '@angular/core';
import {UserDTO} from './DTO/user-dto';
import {AuthRequestService} from './Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'GachiBoardFrontend';
  constructor(
  ){

  }
  ngOnInit(): void {

  }
}
