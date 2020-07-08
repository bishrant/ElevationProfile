import WidgetProperties = __esri.WidgetProperties;

export interface ElevationProfileProperties
  extends ElevationProfileViewModelProperties,
    WidgetProperties {}

export interface ElevationProfileViewModelProperties {
  slopeThreshold?: number;
}