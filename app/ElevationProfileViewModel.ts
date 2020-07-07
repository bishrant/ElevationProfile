/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Accessor = require("esri/core/Accessor");
import request = require("esri/request");
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import { ElevationProfileProperties } from "./interfaces";
import {
  CalculateLength,
  CalculateSlope,
  GetSegmentsWithHigherSlope,
} from "./Uitls";
import {
  CreateNormalElevationLine,
  CreateHigherSlopeLine,
  GetGraphOptions,
} from "./GraphStyles";
import Graphic = require("esri/Graphic");
// import { ItemScoreViewModelProperties, Suggestion } from "./interfaces";

@subclass("esri.widgets.ElevationProfileViewModel")
class ElevationProfileViewModel extends declared(Accessor) {
  constructor(props?: ElevationProfileProperties) {
    super();
  }

  @property()
  slopeThreshold: number;

  @property()
  plot: any;

  @property()
  private ptArray: any;

  getChartData(r: any) {
    // const result = JSON.parse(r);
    let ptArray = JSON.parse(r); //result.results[0].value.features[0].geometry.paths[0];
    ptArray = CalculateLength(ptArray);
    const normalLine = CreateNormalElevationLine(ptArray);

    ptArray = CalculateSlope(ptArray);
    const higherSlope = GetSegmentsWithHigherSlope(
      ptArray,
      this.slopeThreshold
    );
    var higherSlopeLine = CreateHigherSlopeLine(higherSlope);

    var data = [normalLine, higherSlopeLine] as any;
    const options = GetGraphOptions(ptArray);
    this.ptArray = ptArray;
    return [data, options];
  }

    initializeHover(ptArray: any, mapView: __esri.MapView) {
    var myPlot: any = document.getElementById("test");
    myPlot
      .on("plotly_hover", function (data: any) {
        const pId = data.points[0].pointIndex;
        const pt = ptArray[pId];
        var point: any = {
          type: "point", // autocasts as new Point()
          x: pt[0],
          y: pt[1],
          spatialReference: { wkid: 102100 },
        };

        // Create a symbol for drawing the point
        var markerSymbol: any = {
          type: "simple-marker",
          style: "cross",
          color: "cyan",
        };

        // Create a graphic and add the geometry and symbol to it
        var pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
        });
        mapView.graphics.removeAll();
        mapView.graphics.add(pointGraphic);
      })
      .on("plotly_unhover", function (data: any) {
        mapView.graphics.removeAll();
      });
  }
}

export = ElevationProfileViewModel;
