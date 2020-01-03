import {Component, OnInit} from '@angular/core';
import { HttpHelper } from '../../../Model/Helper/http-helper/http-helper';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './login-page.component.html',
  styleUrls: [
    './login-page.component.css',
    "./login-page.component.scss"
  ]
})
export class LoginPageComponent implements OnInit {
  myStyle: object = {};
  myParams: object = {};
  width: number = 100;
  height: number = 100;
  private readonly particleColor = '#EF2938';
  private readonly universalOpacity = 0.3;
  private readonly particleOpacity = this.universalOpacity;
  private readonly lineOpacity = this.universalOpacity;
  private readonly repulseDistance = 150;
  private readonly particleWidth = 8;
  private readonly lineWidth = 2;
  private readonly linkDistance = 300;
  private readonly opacityMin = 1;

  constructor(
    private apiRequester: AuthRequestService
  ) {
  }

  ngOnInit() {
    this.myStyle = {
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'z-index': 1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };

    this.myParams = {
      'particles': {
        'number': {
          'value': 15,
          'density': {
            'enable': true,
            'value_area': 800
          }
        },
        'color': {
          'value': this.particleColor
        },
        'shape': {
          'type': 'polygon',
          'stroke': {
            'width': this.particleWidth,
            'color': this.particleColor
          },
          'polygon': {
            'nb_sides': 5
          },
          'image': {
            'src': 'img/github.svg',
            'width': 100,
            'height': 100
          }
        },
        'opacity': {
          'value': this.particleOpacity,
          'random': false,
          'anim': {
            'enable': false,
            'speed': 1.1,
            'opacity_min': this.opacityMin,
            'sync': false
          }
        },
        'size': {
          'value': 3,
          'random': true,
          'anim': {
            'enable': false,
            'speed': 50,
            'size_min': 0.1,
            'sync': true
          }
        },
        'line_linked': {
          'enable': true,
          'distance': this.linkDistance,
          'color': this.particleColor,
          'opacity': this.lineOpacity,
          'width': this.lineWidth
        },
        'move': {
          'enable': true,
          'speed': 5,
          'direction': 'none',
          'random': false,
          'straight': false,
          'out_mode': 'out',
          'bounce': true,
          'attract': {
            'enable': false,
            'rotateX': 600,
            'rotateY': 1200
          }
        }
      },
      'retina_detect': true
    };
  }

  // Method to sign in with social account
  signIn(platform: string): void {
    HttpHelper.redirectTo(HttpHelper.api.authGoogle.uri);
  }

  // Method to sign out
  signOut(): void {
    this.apiRequester.signOut();
  }
}
