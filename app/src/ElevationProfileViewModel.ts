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
  userGraphic: Graphic;

  @property()
  ptArray: any = [];

  @property()
  state: string = "idle";

  GetElevationData(graphic: Graphic) {
    let feat = graphic.toJSON();
    feat.atttributes = { OID: 1 };
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencoded = new URLSearchParams();
    urlencoded.append("f", "json");
    urlencoded.append("returnZ", "true");
    urlencoded.append("DEMResolution", "FINEST");
    urlencoded.append("ProfileIDField", "ObjectID");
    //format
    let format = {
      fields: [{ name: "OID", type: "esriFieldTypeObjectID", alias: "OID" }],
      geometryType: "esriGeometryPolyline",
      features: [feat],
      sr: { wkid: 102100 },
    };
    urlencoded.append("InputLineFeatures", JSON.stringify(format));
    var requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };
    return fetch(
      "https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute",
      requestOptions
    );
  }
  getHoverInfo = (x: any, y: any, ptArray: any, n: any = 0) => {
    const xArray = ptArray[0][2];
    //   if (typeof n !== 'number') {
    //     return 'test'
    //   }
    console.log(xArray, n);
    //   const slope = ptArray[n][2];
    return y + " feet altitude <br>" + x + " miles from start<br>"; // + this.getS(n)
    //   slope + "% slope";
    //   "n + '' + x + "stest" + xArray;
  };

  getS(s: any) {
    return s;
  }

  getChartData(ptArray0: any) {
    let ptArray = ptArray0.slice();
    ptArray = CalculateLength(ptArray);
    ptArray = CalculateSlope(ptArray);
    let normalLine: any = CreateNormalElevationLine(ptArray);
    var data: any;
    if (this.slopeThreshold > 0) {
      const higherSlope = GetSegmentsWithHigherSlope(
        ptArray,
        this.slopeThreshold
      );
      var higherSlopeLine = CreateHigherSlopeLine(higherSlope);

      data = [normalLine, higherSlopeLine] as any;
    } else {
      data = [normalLine] as any;
    }

    const options = GetGraphOptions(ptArray);
    // this.ptArray = ptArray;
    return [data, options, ptArray];
  }

  initializeHover(Plotly: any, ptArray: any, mapView: __esri.MapView) {
    console.log(ptArray);
    var myPlot: any = document.getElementById("myDiv");
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

      myPlot.on("plotly_hover", function (data: any) {
        var pn = "",
          tn = "",
          colors = [];
        for (var i = 0; i < data.points.length; i++) {
          pn = data.points[i].pointNumber;
          tn = data.points[i].curveNumber;
          colors = data.points[i].data.marker.color;
        }
        colors[pn] = "#C54C82";

        var update = { marker: { color: colors, size: 16 } };
        Plotly.restyle("myDiv", update, [tn as any]);
      });

      myPlot.on("plotly_unhover", function (data: any) {
        var pn = "",
          tn = "",
          colors = [];
        for (var i = 0; i < data.points.length; i++) {
          pn = data.points[i].pointNumber;
          tn = data.points[i].curveNumber;
          colors = data.points[i].data.marker.color;
        }
        colors[pn] = "transparent";

        var update = { marker: { color: colors, size: 16 } };
        Plotly.restyle("myDiv", update, [tn]);
      });
  }
}

export = ElevationProfileViewModel;