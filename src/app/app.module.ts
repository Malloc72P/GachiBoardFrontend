import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './View/SocialLogin/login-page/login-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatButtonToggleModule, MatCardModule, MatRadioModule, MatRippleModule, MatSliderModule} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { WhiteboardMainComponent } from './View/Whiteboard/whiteboard-main/whiteboard-main.component';
import { ParticlesModule } from 'angular-particle';
import { RouterHelperService } from './Model/Helper/router-helper-service/router-helper.service';
import { AuthRequestService } from './Controller/SocialLogin/auth-request/auth-request.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './Controller/SocialLogin/auth-interceptor/auth-interceptor.service';
import { AuthProcessComponent } from './View/SocialLogin/auth-process/auth-process.component';
import {PointerModeManagerService} from './Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

import {PositionCalcService} from "./Model/Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "./Model/Whiteboard/ZoomControl/zoom-control.service";
import {CanvasMoverService} from "./Model/Whiteboard/Pointer/CanvasMover/canvas-mover.service";
import { WhiteboardToolPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/whiteboard-tool-panel.component';
import {FormsModule} from '@angular/forms';
import { ToolBrushPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/tool-brush-panel/tool-brush-panel.component';
import {PanelManagerService} from './Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {ColorPickerModule} from 'ngx-color-picker';
import {BrushService} from './Model/Whiteboard/Pointer/brush-service/brush.service';
import {EraserService} from './Model/Whiteboard/Pointer/eraser-service/eraser.service';
import {LassoSelectorService} from './Model/Whiteboard/Pointer/lasso-selector-service/lasso-selector.service';
import { DebugingPannelComponent } from './View/debuging-pannel/debuging-pannel.component';
import {DebugingService} from "./Model/Helper/DebugingHelper/debuging.service";
import {MatExpansionModule} from "@angular/material/expansion";
import {DragDropModule} from "@angular/cdk/drag-drop";
import { ToolHighlighterPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/tool-highlighter-panel/tool-highlighter-panel.component';
import {HighlighterService} from './Model/Whiteboard/Pointer/highlighter-service/highlighter.service';

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
    path: 'login/success/:authToken/:idToken/:email/:userName',
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
    WhiteboardToolPanelComponent,
    ToolBrushPanelComponent,
    DebugingPannelComponent,
    ToolHighlighterPanelComponent,
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
    HttpClientModule,
    MatButtonToggleModule,
    MatRadioModule,
    FormsModule,
    MatRippleModule,
    MatSliderModule,
    ColorPickerModule,
    MatExpansionModule,
    DragDropModule
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
    PositionCalcService,
    ZoomControlService,
    CanvasMoverService,
    PanelManagerService,
    BrushService,
    EraserService,
    LassoSelectorService,
    HighlighterService,
    DebugingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
