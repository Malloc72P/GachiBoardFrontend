import {AfterViewInit, Component, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {HtmlHelperService} from '../../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {RouterHelperService} from '../../../../../Model/Helper/router-helper-service/router-helper.service';
import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css', './../../../gachi-font.css']
})
export class ProjectCardComponent implements OnInit, AfterViewInit {
  @ViewChild('projectCard') projectCard;
  @Input() projectDto:ProjectDto;
  @Input()marginValue = '0px';

  public isHovering = false;

  public projectCardEl:HTMLElement;

  public m = [4][4];

  constructor(
    public renderer: Renderer2,
    public htmlHelperService:HtmlHelperService,
    public routerHelperService:RouterHelperService
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(): void {
    console.log("ProjectCardComponent >> ngAfterViewInit >> projectCard : ",this.projectCard);
    this.projectCardEl = this.projectCard.nativeElement
  }

  onMouseMove(event){

    let offset = this.htmlHelperService.offset(this.projectCardEl);
    let relX:number = event.pageX - offset.left;
    let relY:number = event.pageY - offset.top;
    let offsetMinX:number = this.htmlHelperService.width(this.projectCardEl);
    let offsetMinY:number = this.htmlHelperService.height(this.projectCardEl);
    let currentX = relX += offsetMinX * -0.5;
    let currentY = relY += offsetMinY * -0.5;
    let newX = currentX/700000;
    let newY = currentY/1500000;

    this.renderer.setStyle(this.projectCardEl, 'transform',
      "matrix3d(1.025,0,0,"+-newX+",0,1.025,0,"+-newY+",0,0,1,0,0,0,0,1)" );
  }
  onMouseLeave(event){
    this.renderer.setStyle(this.projectCardEl, 'transform',
      "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)" );
  }

  onProjectCardClick(){
    this.routerHelperService.goToProjectPage(this.projectDto._id);
  }

  public getCreaterName(participantList, createdBy){
    for(let i = 0 ; i < participantList.length; i++){
      let currParticipant = participantList[i];
      if(createdBy === currParticipant.idToken){
        return currParticipant.userName;
      }
    }
  }


}
