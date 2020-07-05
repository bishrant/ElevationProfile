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

@subclass("esri.widgets.ElevationProfile")
class ElevationProfile extends declared(Widget) {

  constructor(params?: any) {
    super();
    // this._onViewChange = this._onViewChange.bind(this);

  }
  postInitialize() {
    this.mapView.watch("center", () => this._onViewChange());
    // this.mapView.on("click", function (event) {console.log(event) });
    watchUtils.init(this, "view.center, view.interacting, view.scale", () => this._onViewChange());
    this.initSketchVM();
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
  map: Map;

  render() {
    const { x, y, scale } = this.state;
    return (
      <div>
        {x} {y}
        <button bind={this} onclick={this._startDrawing}>
          Activate Lasers
        </button>
        <div id="myDiv" style="height: 300px; width: 600px"></div>
      </div>
    );
  }



  private initSketchVM() {
    const graphicsLayer = new GraphicsLayer();
    this.map.add(graphicsLayer);
    this.sketchVM = new SketchViewModel({
      layer: graphicsLayer,
      view: this.mapView
    });
    this._DrawingComplete();
    // this.send();


    




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
    // myHeaders.append("Access-Control-Allow-Credentials", "true");
    // myHeaders.append("Access-Control-Allow-Origin", "http://localhost:4501");
    // myHeaders.append("Cookie", "AGS_ROLES=\"419jqfa+uOZgYod4xPOQ8Q==\"; AWSELB=2D7D79D118CF06FE55F3FE32B215F683FD69AAD5B71D10B50FF8BC5EED565120D0BDD53770A2473F86F08B1123AB8951C1F07DFAF2C75669499EF31ED6E1F9477C89C85FA3; AWSELBCORS=2D7D79D118CF06FE55F3FE32B215F683FD69AAD5B71D10B50FF8BC5EED565120D0BDD53770A2473F86F08B1123AB8951C1F07DFAF2C75669499EF31ED6E1F9477C89C85FA3");

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
      .then(response => response.text())
      .then(result => {
        that.createChart(result);
      }
      )
      .catch(error => console.log('error', error));
  }

  private createChart(r: any) {
    import('https://cdn.plot.ly/plotly-latest.min.js').then((Plotly) => {
      const result = JSON.parse(r);
      const ptArray = result.results[0].value.features[0].geometry.paths[0];
      var trace1 = {
        x: ptArray.map((p: any, i: any) => i + 1),
        y: ptArray.map((p: any) => p[2]),
        type: 'scatter'
      };

      var data = [trace1] as any;
      console.log(ptArray);
      Plotly.newPlot('myDiv', data);
    })
  }
  private displayLineChart(graphic: Graphic) {
    console.log(graphic.toJSON());
    let g = graphic.toJSON();
    g.atttributes = { 'OID': 1 };
    this.send(g);
  }
}

export = ElevationProfile;