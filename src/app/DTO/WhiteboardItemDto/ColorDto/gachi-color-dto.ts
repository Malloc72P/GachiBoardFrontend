import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

export class GachiColorDto {
  public red;
  public green;
  public blue;
  public alpha;

  constructor(red, green, blue, alpha?) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    if(alpha){
      this.alpha = alpha;
    }else{
      this.alpha = 1;
    }
  }

  public static clone(dto: GachiColorDto): GachiColorDto {
    if(!!dto) {
      return new GachiColorDto(dto.red, dto.green, dto.blue, dto.alpha);
    }
    return undefined;
  }

  public static setColorByPaperColor(target: GachiColorDto, color: Color) {
    target.red   = color.red;
    target.green = color.green;
    target.blue  = color.blue;
    target.alpha = color.alpha;
  }

  public static createColor(color:Color): GachiColorDto {
    if(!color){
      return new GachiColorDto(0,0,0,1);
    }
    return new GachiColorDto(
      color.red, color.green, color.blue, color.alpha
    );
  }

  public static getPaperColor(dto: GachiColorDto): Color{
    return new Color(dto.red, dto.green, dto.blue, dto.alpha);
  }
}

export class GachiColorList {
  public static getColor(idx){
    switch (idx) {
      case 0 :
        return "red";
      case 1 :
        return "blue";
      case 2 :
        return "black";
      case 3 :
        return "purple";
      case 4 :
        return "indigo";
      case 5 :
        return "orange";
      case 6 :
        return "brown";
    }
  }
}
