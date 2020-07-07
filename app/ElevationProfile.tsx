/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property, aliasOf } from "esri/core/accessorSupport/decorators";

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
import ElevationProfileViewModel = require("./ElevationProfileViewModel");
import { ElevationProfileProperties } from "./interfaces";

@subclass("esri.widgets.ElevationProfile")
class ElevationProfile extends declared(Widget) {

  constructor(props: ElevationProfileProperties) {
    super();
  }

  @property()
  map: Map;

  @property()
  @renderable()
  state: any;

  @property()
  mapView: MapView;

  @property()
  sketchVM: SketchViewModel;

  @property()
  plot: any;

  @property()
  @renderable([
    "viewModel.slopeThreshold"
  ])
  viewModel: ElevationProfileViewModel = new ElevationProfileViewModel();

  @aliasOf("viewModel.slopeThreshold")
  slopeThreshold: ElevationProfileViewModel["slopeThreshold"];


  render() {
    const { slopeThreshold } = this.viewModel;
    return (
      <div>
        Steep slope &gt;{slopeThreshold}%
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
  protected _renderChart(data: any[], options: any): any {
    let that = this;
    Plotly.newPlot('test', data, options, { displayModeBar: false }).then(function (plot: any) {
      that.viewModel.plot = plot;
    })
    return null;
  }

  private createChart(r: any) {
    // const result = JSON.parse(r);
    let ptArray = JSON.parse(r); //result.results[0].value.features[0].geometry.paths[0];
    const [data, options] = this.viewModel.getChartData(r);
    this._renderChart(data, options);
    this.viewModel.initializeHover(ptArray, this.mapView);
  }
  private displayLineChart(graphic: Graphic) {
    let g = graphic.toJSON();
    g.atttributes = { 'OID': 1 };
    this.send(g);
  }
}

export = ElevationProfile;