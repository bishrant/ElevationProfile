/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");
import MapView = require("esri/views/MapView");
import Map = require("esri/Map");
import * as watchUtils from "esri/core/watchUtils";
import { renderable, tsx } from "esri/widgets/support/widget";
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import Polyline = require("esri/geometry/Polyline");
import { planarLength } from "esri/geometry/geometryEngine";
import * as Plotly from 'https://cdn.plot.ly/plotly-latest.min.js';
import { max, min, dt, CalculateLength, CalculateSlope, GetSegmentsWithHigherSlope } from "./Uitls";
import { CreateHigherSlopeLine, CreateNormalElevationLine, GetGraphOptions } from "./GraphStyles";

@subclass("esri.widgets.ElevationProfile")
class ElevationProfile extends declared(Widget) {

  constructor(params?: any, slopeThreshold: number = 8) {
    super();
    this.slopeThreshold = slopeThreshold;
  }

  @property()
  @renderable()
  state: any;

  @property()
  @renderable()
  mapView: MapView;


  @property()
  sketchVM: SketchViewModel;

  @property()
  plot: any;

  @renderable()
  @property()
  slopeThreshold: number;

  @property()
  map: Map;

  render() {
    return (
      <div>
        Steep slope &gt;{this.slopeThreshold}%
        <button bind={this} onclick={this._startDrawing}>
          Draw
        </button>
        <div id="myDiv" style="height: 300px; width: 600px"></div>
        <button onclick={this.exportImage}>Create Report</button>
      </div>
    );
  }

  postInitialize() {
    this.mapView.watch("center", () => this._onViewChange());
    // this.mapView.on("click", function (event) {console.log(event) });
    watchUtils.init(this, "view.center, view.interacting, view.scale", () => this._onViewChange());
    this.initSketchVM();
  }

  private exportImage() {
    var myPlot: any = document.getElementById('myDiv');
    Plotly.toImage(myPlot, { height: 300, width: 300 })
      .then(
        function (url: any) {
          console.log(url);
        }
      )
  }

  private initSketchVM() {
    const graphicsLayer = new GraphicsLayer();
    this.map.add(graphicsLayer);
    this.sketchVM = new SketchViewModel({
      layer: graphicsLayer,
      view: this.mapView
    });
    this._DrawingComplete();
    this.createChart(dt);
  }
  private _startDrawing() {
    this.sketchVM.create('polyline');
  }
  private _onViewChange() {
    let { interacting, center, scale } = this.mapView;
    this.state = {
      x: center.x,
      y: center.y,
      interacting,
      scale
    }
  }


  private _DrawingComplete() {
    var that = this;
    this.sketchVM.on('create', function (evt: any) {
      if (evt.state === 'complete') {
        console.log(evt.graphic);
        that.displayLineChart(evt.graphic);
      }
    })
  }

  private send(feat: any) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencoded = new URLSearchParams();
    urlencoded.append("f", "json");
    urlencoded.append("returnZ", "true");
    urlencoded.append("DEMResolution", "FINEST");
    urlencoded.append("ProfileIDField", "ObjectID");
    //format
    let format = {
      "fields": [{ "name": "OID", "type": "esriFieldTypeObjectID", "alias": "OID" }],
      "geometryType": "esriGeometryPolyline", "features": [feat], "sr": { "wkid": 102100 }
    }
    urlencoded.append("InputLineFeatures", JSON.stringify(format));
    var requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow'
    };
    const that = this;
    fetch("https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute", requestOptions)
      .then((response: any) => response.text())
      .then((result: any) => {
        // that.createChart(result);
      }
      )
      .catch((error: any) => console.log('error', error));
  }

  private createChart(r: any) {

    const that = this;
    // const result = JSON.parse(r);
    let ptArray = JSON.parse(r); //result.results[0].value.features[0].geometry.paths[0];
    ptArray = CalculateLength(ptArray);
    const normalLine = CreateNormalElevationLine(ptArray);

    ptArray = CalculateSlope(ptArray);
    const higherSlope = GetSegmentsWithHigherSlope(ptArray, this.slopeThreshold);
    var higherSlopeLine = CreateHigherSlopeLine(higherSlope);

    var data = [normalLine, higherSlopeLine] as any;
    const options = GetGraphOptions(ptArray);
    Plotly.newPlot('test', data, options).then(function (plot: any) {
      that.plot = plot;
    })
    var myPlot: any = document.getElementById('test');
    myPlot.on('plotly_hover', function (data: any) {
      const pId = data.points[0].pointIndex;
      const pt = ptArray[pId];
      var point: any = {
        type: "point",  // autocasts as new Point()
        x: pt[0],
        y: pt[1],
        spatialReference: { wkid: 102100 }
      };

      // Create a symbol for drawing the point
      var markerSymbol: any = {
        type: "simple-marker",
        style: "cross",
        color: "cyan"
      };

      // Create a graphic and add the geometry and symbol to it
      var pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });
      that.mapView.graphics.removeAll();
      that.mapView.graphics.add(pointGraphic);
    })
      .on('plotly_unhover', function (data: any) {
        that.mapView.graphics.removeAll();
      });
    // })
  }
  private displayLineChart(graphic: Graphic) {
    console.log(graphic.toJSON());
    let g = graphic.toJSON();
    g.atttributes = { 'OID': 1 };
    this.send(g);
  }
}

export = ElevationProfile;