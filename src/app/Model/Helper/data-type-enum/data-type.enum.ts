export enum DataType {
  INFINITE_CANVAS,
  MINIMAP_USER_VIEW,
  MINIMAP_MAP_LAYER,
  MINIMAP_CURSOR_LAYER,
  DRAWING_CANVAS,
  EREASER,
  LASSO_HANDLER,
  LASSO_LINK_PORT_HANDLER,
}
export enum WhiteboardItemType {
  SIMPLE_STROKE,
  HIGHLIGHT_STROKE,
  EDITABLE_RECTANGLE,
  EDITABLE_CIRCLE,
  EDITABLE_TRIANGLE,
  EDITABLE_CARD,
  SIMPLE_RASTER
}

export enum DataState {
  MOVING,
  RESIZING,
  LINK_EDITING
}

export enum DataName {
  SELECT_RANGE = "SelectRange",
  SELECT_HANDLER = "SelectHandler",
}

export enum ShapeStyle {
  RECTANGLE,
  CIRCLE,
  TRIANGLE,
  ROUND_RECTANGLE,
}

export enum ItemName {
  BRUSH_STROKE = "Brush_Stroke",
  HIGHLIGHTER_STROKE = "Highlighter_Stroke",
  SHAPE = "Shape",
  ERASER_TRAIL = "Eraser_Trail",
  LASSO_STROKE = "Lasso_Stroke",
}
