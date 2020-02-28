import {EventEmitter} from "@angular/core";
import {Align, TextStyle} from "../../../../../Model/Whiteboard/Pointer/shape-service/text-style";

export class GachiTextStyleDto {
  public fontFamily: string;
  public fontSize: number;
  public fontColor: string;
  public isItalic: boolean;
  public isBold: boolean;
  public horizontalAlign: Align;
  public verticalAlign: Align;

  constructor(fontFamily: string, fontSize: number, fontColor: string, isBold: boolean, isItalic: boolean, horizontalAlign: Align, verticalAlign: Align) {
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.isBold = isBold;
    this.isItalic = isItalic;
    this.horizontalAlign = horizontalAlign;
    this.verticalAlign = verticalAlign;
  }

  public static clone(dto: GachiTextStyleDto): GachiTextStyleDto {
    return new GachiTextStyleDto(
      dto.fontFamily, dto.fontSize, dto.fontColor,
      dto.isBold, dto.isItalic, dto.horizontalAlign, dto.verticalAlign
    );
  }

  public static create(style: TextStyle): GachiTextStyleDto{
    return new GachiTextStyleDto(
      style.fontFamily, style.fontSize, style.fontColor,
      style.isBold, style.isItalic, style.horizontalAlign, style.verticalAlign
    )
  }

  public static getTextStyle(dto: GachiTextStyleDto): TextStyle{
    return new TextStyle(
      dto.fontFamily, dto.fontSize, dto.fontColor,
      dto.isBold, dto.isItalic, dto.horizontalAlign, dto.verticalAlign
    );
  }
}
