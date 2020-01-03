import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './View/SocialLogin/login-page/login-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { WhiteboardMainComponent } from './View/Whiteboard/whiteboard-main/whiteboard-main.component';
import { ParticlesModule } from 'angular-particle';
import { RouterHelperService } from './Model/Helper/router-helper-service/router-helper.service';
import { AuthRequestService } from './Controller/SocialLogin/auth-request/auth-request.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './Controller/SocialLogin/auth-interceptor/auth-interceptor.service';
import { AuthProcessComponent } from './View/SocialLogin/auth-process/auth-process.component';
import {PointerModeManagerService} from './Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    data: { title: 'SocialLogin' }
  },
  {
    path: '',
    redirectTo: 'whiteboard',
    pathMatch: 'full'
  },
  {
    path: 'whiteboard',
    component: WhiteboardMainComponent,
    data: { title: 'Whiteboard' }
  },
  {
    path: 'login/succes/:authToken/:idToken/:email/:userName',
    component: AuthProcessComponent,
    data: { title: 'Whiteboard' }
  },
  {
    path: 'login/failure',
    component: AuthProcessComponent,
    data: { title: 'Whiteboard' }
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    WhiteboardMainComponent,
    AuthProcessComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: true} // 디버그 활성화
    ),
    ParticlesModule,
    MatButtonModule,
    HttpClientModule
  ],
  providers: [
    RouterHelperService,
    AuthRequestService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    PointerModeManagerService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
