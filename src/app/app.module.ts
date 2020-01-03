import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './View/SocialLogin/login-page/login-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { WhiteboardMainComponent } from './View/Whiteboard/whiteboard-main/whiteboard-main.component';
import { ParticlesModule } from 'angular-particle';

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
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    WhiteboardMainComponent,
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
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
