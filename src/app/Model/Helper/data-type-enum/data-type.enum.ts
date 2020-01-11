export enum DataType {
  INFINITE_CANVAS,
  MINIMAP_USER_VIEW,
  MINIMAP_MAP_LAYER,
  MINIMAP_CURSOR_LAYER,
  DRAWING_CANVAS,
  EREASER,
}

export enum DataState {
  MOVING,
  RESIZING,
}

export enum DataName {
  SELECT_RANGE = "SelectRange",
  SELECT_HANDLER = "SelectHandler",
}

export enum ShapeStyle {
  RECTANGLE,
  CIRCLE,
  TRIANGLE,
}
