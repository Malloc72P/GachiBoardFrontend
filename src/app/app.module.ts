import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './View/NormalPages/SocialLogin/login-page/login-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { WhiteboardMainComponent } from './View/Whiteboard/whiteboard-main/whiteboard-main.component';
import { RouterHelperService } from './Model/Helper/router-helper-service/router-helper.service';
import { AuthRequestService } from './Controller/SocialLogin/auth-request/auth-request.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './Controller/SocialLogin/auth-interceptor/auth-interceptor.service';
import { AuthProcessComponent } from './View/NormalPages/SocialLogin/auth-process/auth-process.component';
import {PointerModeManagerService} from './Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

import {PositionCalcService} from "./Model/Whiteboard/PositionCalc/position-calc.service";
import {ZoomControlService} from "./Model/Whiteboard/InfiniteCanvas/ZoomControl/zoom-control.service";
import {CanvasMoverService} from "./Model/Whiteboard/Pointer/CanvasMover/canvas-mover.service";
import { WhiteboardToolPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/whiteboard-tool-panel.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import { WhiteboardMinimapComponent } from './View/Whiteboard/whiteboard-minimap/whiteboard-minimap.component';
import {MinimapSyncService} from './Model/Whiteboard/InfiniteCanvas/MinimapSync/minimap-sync.service';
import { ToolHighlighterPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/tool-highlighter-panel/tool-highlighter-panel.component';
import {HighlighterService} from './Model/Whiteboard/Pointer/highlighter-service/highlighter.service';
import { ProjectSupporterPannelComponent } from './View/Whiteboard/project-supporter-pannel/project-supporter-pannel.component';
import { KanbanComponent } from './View/NormalPages/kanban/kanban.component';
import {PopupManagerService} from './Model/PopupManager/popup-manager.service';
import { KanbanTagListComponent } from './View/NormalPages/kanban/kanban-tag-list/kanban-tag-list.component';
import {KanbanTagListManagerService} from './Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {AnimeManagerService} from './Model/AnimeManager/anime-manager.service';
import { KanbanItemEditComponent } from './View/NormalPages/kanban/kanban-item-edit/kanban-item-edit.component';
import {UserManagerService} from './Model/UserManager/user-manager.service';
import {KanbanItemColorService} from './Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import { KanbanItemCreateComponent } from './View/NormalPages/kanban/kanban-item-create/kanban-item-create.component';
import { KanbanGroupSettingComponent } from './View/NormalPages/kanban/kanban-group-setting/kanban-group-setting.component';
import { KanbanTagManagementComponent } from './View/NormalPages/kanban/kanban-tag-management/kanban-tag-management.component';
import { AreYouSurePanelComponent } from './View/Commons/are-you-sure-panel/are-you-sure-panel.component';
import {AreYouSurePanelService} from './Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';
import { ToolShapePanelComponent } from './View/Whiteboard/whiteboard-tool-panel/tool-shape-panel/tool-shape-panel.component';
import {DrawingLayerManagerService} from './Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {ImportFileService} from "./Model/Whiteboard/ImportFile/import-file.service";
import { WhiteboardContextMenuComponent } from './View/Whiteboard/whiteboard-context-menu/whiteboard-context-menu.component';
import {ContextMenuService} from "./Model/Whiteboard/ContextMenu/context-menu-service/context-menu.service";
import {NormalPointerService} from './Model/Whiteboard/Pointer/normal-pointer-service/normal-pointer.service';
import {LinkModeManagerService} from './Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service';
import {CursorTrackerService} from "./Model/Whiteboard/CursorTracker/cursor-tracker-service/cursor-tracker.service";
import {CursorChangeService} from "./Model/Whiteboard/Pointer/cursor-change-service/cursor-change.service";
import { HorizonContextMenuComponent } from './View/Whiteboard/whiteboard-context-menu/horizon-context-menu/horizon-context-menu.component';
import { SubPanelForLineComponent } from './View/Whiteboard/whiteboard-context-menu/horizon-context-menu/sub-panel-line/sub-panel-for-line.component';
import { SubPanelForFillComponent } from './View/Whiteboard/whiteboard-context-menu/horizon-context-menu/sub-panel-fill/sub-panel-for-fill.component';
import {HorizonContextMenuService} from "./Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import { SubPanelForArrowComponent } from './View/Whiteboard/whiteboard-context-menu/horizon-context-menu/sub-panel-arrow/sub-panel-for-arrow.component';
import { SubPanelForFontComponent } from './View/Whiteboard/whiteboard-context-menu/horizon-context-menu/sub-panel-font/sub-panel-for-font.component';
import { HomePageComponent } from './View/NormalPages/home-page/home-page.component';
import { MainPageComponent } from './View/NormalPages/main-page/main-page.component';
import { GachiFooterComponent } from './View/NormalPages/page-sub-parts/footer/gachi-footer/gachi-footer.component';
import { RightButtonGroupComponent } from './View/NormalPages/page-sub-parts/header/right-button-group/right-button-group.component';
import { GachiHeaderComponent } from './View/NormalPages/page-sub-parts/header/gachi-header/gachi-header.component';
import { GachiRightSidebarComponent } from './View/NormalPages/page-sub-parts/sidebars/gachi-right-sidebar/gachi-right-sidebar.component';
import {GachiSidebarManagerService} from './Model/NormalPagesManager/gachi-sidebar-manager/gachi-sidebar-manager.service';
import { SignOutComponent } from './View/NormalPages/SocialLogin/sign-out/sign-out.component';
import { GachiMainHeaderComponent } from './View/NormalPages/page-sub-parts/header/gachi-main-header/gachi-main-header.component';
import { GachiLeftSidebarComponent } from './View/NormalPages/page-sub-parts/sidebars/gachi-left-sidebar/gachi-left-sidebar.component';
import { ProjectCardComponent } from './View/NormalPages/page-sub-parts/cards/project-card/project-card.component';
import {UserCardComponent} from './View/NormalPages/page-sub-parts/cards/user-card/user-card.component';
import {HtmlHelperService} from './Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import { MainPageRootComponent } from './View/NormalPages/main-page/main-page-root/main-page-root.component';
import { MainPageProjectComponent } from './View/NormalPages/main-page/main-page-project/main-page-project.component';
import { KanbanCardComponent } from './View/NormalPages/page-sub-parts/cards/kanban-card/kanban-card.component';
import { WhiteboardCardComponent } from './View/NormalPages/page-sub-parts/cards/whiteboard-card/whiteboard-card.component';
import { UserOverlayCardComponent } from './View/NormalPages/page-sub-parts/cards/user-overlay-card/user-overlay-card.component';
import { CreateProjectComponent } from './View/NormalPages/main-page/main-page-root/create-project/create-project.component';
import {ProjectRequesterService} from './Controller/Project/project-requester.service';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {HttpHelper} from './Model/Helper/http-helper/http-helper';
import { CreateInviteCodeComponent } from './View/NormalPages/main-page/main-page-project/create-invite-code/create-invite-code.component';
import { InvitationComponent } from './View/NormalPages/invitation/invitation.component';
import {KanbanEventManagerService} from './Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';
import {UiService} from './Model/Helper/ui-service/ui.service';
import {OverlayModule} from '@angular/cdk/overlay';
import {LinkService} from "./Model/Whiteboard/Pointer/link-service/link.service";
import {MatProgressSpinnerModule, MatSpinner} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatSliderModule} from '@angular/material/slider';
import {MatDividerModule} from '@angular/material/divider';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatStepperModule} from '@angular/material/stepper';
import {MatBadgeModule} from '@angular/material/badge';
import { CreateWbSessionComponent } from './View/NormalPages/main-page/main-page-project/create-wb-session/create-wb-session.component';
import { ToolLinkPanelComponent } from './View/Whiteboard/whiteboard-tool-panel/tool-link-panel/tool-link-panel.component';
import {WhiteboardBannerComponent} from './View/Whiteboard/whiteboard-banner/whiteboard-banner.component';
import { EditProjectComponent } from './View/NormalPages/main-page/main-page-root/edit-project/edit-project.component';
import { EditWbSessionComponent } from './View/NormalPages/main-page/main-page-project/edit-wb-session/edit-wb-session.component';
import { VideoChatPanelComponent } from './View/Whiteboard/video-chat/video-chat-panel/video-chat-panel.component';
import {VideoChatPanelManagerService} from "./Model/Whiteboard/VideoChat/video-chat-panel-manager/video-chat-panel-manager.service";
import { VideoChatWrapperComponent } from './View/Whiteboard/video-chat/video-chat-wrapper/video-chat-wrapper.component';
import {VideoChatService} from "./Model/Whiteboard/VideoChat/video-chat/video-chat.service";
import { TimeTimerComponent } from './View/Whiteboard/time-timer/time-timer.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { TextChatCoreComponent } from './View/Whiteboard/text-chat/text-chat-core/text-chat-core.component';
import {TextChatService} from "./Model/Whiteboard/TextChat/text-chat.service";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {ExportFileService} from "./Model/Whiteboard/ExportFile/export-file.service";
import { ExportFileComponent } from './View/Whiteboard/export-file/export-file.component';

const config: SocketIoConfig = { url: HttpHelper.apiUrl, options: {} };

const appRoutes: Routes = [
  {
    path: 'homepage',
    component: HomePageComponent,
    data: { title: 'Home' }
  },
  {
    path: 'mainpage',
    component: MainPageComponent,
    data: { title: 'MainPage' },
    children : [
      {
        path: '',
        component: MainPageRootComponent,
        outlet:'mainpage',
      },
    ]
  },
  {
    path: 'project',
    component: MainPageComponent,
    data: { title: 'MainPage' },
    children : [
      {
        path: '',
        component: MainPageProjectComponent,
        outlet:'mainpage',
      },
    ]
  },
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full'
  },
  {
    path: 'invitation',
    component: InvitationComponent,
    data: { title: 'Invitation' }
  },
  {
    path: 'login',
    component: LoginPageComponent,
    data: { title: 'SocialLogin' }
  },
  {
    path: 'signout',
    component: SignOutComponent,
    data: { title: 'SignOut' }
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
    data: { title: 'homepage' }
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
    WhiteboardMinimapComponent,
    ToolHighlighterPanelComponent,
    ProjectSupporterPannelComponent,
    KanbanComponent,
    KanbanTagListComponent,
    KanbanItemEditComponent,
    KanbanItemCreateComponent,
    KanbanGroupSettingComponent,
    KanbanTagManagementComponent,
    AreYouSurePanelComponent,
    ToolShapePanelComponent,
    WhiteboardContextMenuComponent,
    HorizonContextMenuComponent,
    SubPanelForLineComponent,
    SubPanelForFillComponent,
    SubPanelForArrowComponent,
    SubPanelForFontComponent,
    HomePageComponent,
    MainPageComponent,
    GachiFooterComponent,
    RightButtonGroupComponent,
    GachiHeaderComponent,
    GachiRightSidebarComponent,
    SignOutComponent,
    GachiMainHeaderComponent,
    GachiLeftSidebarComponent,
    ProjectCardComponent,
    UserCardComponent,
    MainPageRootComponent,
    MainPageProjectComponent,
    KanbanCardComponent,
    WhiteboardCardComponent,
    UserOverlayCardComponent,
    CreateProjectComponent,
    CreateInviteCodeComponent,
    InvitationComponent,
    CreateWbSessionComponent,
    ToolLinkPanelComponent,
    WhiteboardBannerComponent,
    EditProjectComponent,
    EditWbSessionComponent,
    VideoChatPanelComponent,
    VideoChatWrapperComponent,
    TimeTimerComponent,
    TextChatCoreComponent,
    ExportFileComponent,
  ],
  entryComponents: [
    KanbanComponent,
    KanbanItemEditComponent,
    KanbanItemCreateComponent,
    KanbanGroupSettingComponent,
    KanbanTagManagementComponent,
    AreYouSurePanelComponent,
    CreateProjectComponent,
    CreateInviteCodeComponent,
    EditProjectComponent,
    EditWbSessionComponent,
    MatSpinner
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    RouterModule.forRoot(
      appRoutes,
      /*{enableTracing: true} // 디버그 활성화*/
    ),
    MatButtonModule,
    HttpClientModule,
    MatButtonToggleModule,
    MatRadioModule,
    FormsModule,
    MatRippleModule,
    MatSliderModule,
    ColorPickerModule,
    MatExpansionModule,
    DragDropModule,
    MatDividerModule,
    MatGridListModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    SocketIoModule.forRoot(config),
    MatStepperModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    OverlayModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    MatSnackBarModule,
    MatBottomSheetModule,
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
    NormalPointerService,
    DebugingService,
    MinimapSyncService,
    HighlighterService,
    PopupManagerService,
    KanbanTagListManagerService,
    AnimeManagerService,
    UserManagerService,
    KanbanItemColorService,
    AreYouSurePanelService,
    DrawingLayerManagerService,
    ImportFileService,
    ContextMenuService,
    LinkModeManagerService,
    CursorTrackerService,
    CursorChangeService,
    HorizonContextMenuService,
    AuthRequestService,
    GachiSidebarManagerService,
    HtmlHelperService,
    ProjectRequesterService,
    KanbanEventManagerService,
    UiService,
    LinkService,
    VideoChatPanelManagerService,
    VideoChatService,
    TextChatService,
    ExportFileService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
