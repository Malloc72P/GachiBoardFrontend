import { Injectable } from '@angular/core';

// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Layer = paper.Layer;

import * as paper from 'paper';

@Injectable({
  providedIn: 'root'
})
export class PositionCalcService {
  private currentProject: Project;

  private htmlCanvasObject: HTMLCanvasElement;
  private htmlCanvasWrapperObject: HTMLDivElement;

  constructor() {
  }

  public initializePositionCalcService( currentProject: Project ){
    this.currentProject = currentProject;

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlCanvasWrapperObject
      = document.getElementById("canvasWrapper") as HTMLDivElement;
  }

  public getCenterOfBrowser(){
    return this.getCenterPosition( this.htmlCanvasWrapperObject );
  }
  public getBottomRightPositionOfBrowser(){
    return this.getBottomRightPosition( this.htmlCanvasWrapperObject );
  }
  public getWidthOfBrowser(){
    return this.getWidthOfHtmlElement(this.htmlCanvasWrapperObject);
  }
  public getHeightOfBrowser(){
    return this.getHeightOfHtmlElement(this.htmlCanvasWrapperObject);
  }

  public getCenterPosition(el) {
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point(width / 2, height / 2);
  }

  public getBottomRightPosition(el) {
    let width = this.getWidthOfHtmlElement(el);
    let height = this.getHeightOfHtmlElement(el);
    return new Point(width, height);
  }

  public getWidthOfHtmlElement(el) {
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
  }

  public getHeightOfHtmlElement(el) {
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
  }

  public calcPointDistanceOn2D(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  public calcMidPointOn2D(p1: Point, p2: Point) {
    return new Point( (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 );
  }
  public getZoomState(){
    return this.currentProject.view.zoom;
  }

  public reflectZoom(position){
    return position / this.getZoomState();
  }
  public reflectZoomWithPoint(point){
    return new Point( point.x / this.getZoomState(), point.y / this.getZoomState() );
  }
  public restoreZoomWithPoint(point) {
    return new Point(point.x * this.getZoomState(), point.y * this.getZoomState());
  }
  public ngPointToCanvas(point){
    let paperLeftTop = this.currentProject.view.bounds.topLeft;
    return new Point(
      paperLeftTop.x + point.x,
      paperLeftTop.y + point.y
    );
  }
  public canvasPointToNgPoint(point) {
    let paperLeftTop = this.currentProject.view.bounds.topLeft;
    return new Point(
      point.x - paperLeftTop.x,
      point.y - paperLeftTop.y
    );
  }
  public advConvertNgToPaper(point: paper.Point){
    point = this.reflectZoomWithPoint(point);
    point = this.ngPointToCanvas(point);
    return new Point(point.x, point.y);
  }
  public advConvertPaperToNg(point: paper.Point) {
    point = this.canvasPointToNgPoint(point);
    point = this.restoreZoomWithPoint(point);

    return point.clone();
  }

  public calcPopupPanelLeftMargin(){
    return (this.getWidthOfBrowser() - this.getWidthOfBrowser() * 0.9 - 32) / 2
  }
  public calcPopupPanelRightMargin(){
    return (this.getHeightOfBrowser() - this.getHeightOfBrowser() * 0.9 - 32) / 2
  }


}
