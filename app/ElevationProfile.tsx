/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property, aliasOf } from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");
import MapView = require("esri/views/MapView");
import { renderable, tsx } from "esri/widgets/support/widget";
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import * as Plotly from 'https://cdn.plot.ly/plotly-latest.min.js';
import { dt } from "./Uitls";
import ElevationProfileViewModel = require("./ElevationProfileViewModel");
import { ElevationProfileProperties } from "./interfaces";
import { CSS } from './resources';

@subclass("esri.widgets.ElevationProfile")
class ElevationProfile extends declared(Widget) {

  constructor(props: ElevationProfileProperties) {
    super();
  }

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
    "viewModel.slopeThreshold",
    "viewModel.state"
  ])
  viewModel: ElevationProfileViewModel = new ElevationProfileViewModel();

  @aliasOf("viewModel.slopeThreshold")
  slopeThreshold: ElevationProfileViewModel["slopeThreshold"];


  render() {
    const { slopeThreshold, state } = this.viewModel;
    return (
      <div class={this.classes(CSS.esriWidget, CSS.root)}>
        <div>
          {state === 'idle' ? null :
            state === 'loading' ? this._renderLoader() :
              this._renderElevationProfile()
          }
        </div> 
        
        <div id="myDiv" class={this.classes({'elevation-profile__chart' : state !== 'idle', 'elevation-profile__hidden': state !== 'ready'})}></div>
      </div>
    );
  }

  postInitialize() {
    this.initSketchVM();
  }

  private _renderLoader() {
    return (
      <div class ={this.classes(CSS.chart, CSS.loading)}>
        <div>Loading</div>
        <img src='http://superstorefinder.net/support/wp-content/uploads/2018/01/blue_loading.gif' style="width: 100px" alt="loading"/>
      </div>
    );
  }

  private _renderElevationProfile() {
    const { slopeThreshold, state } = this.viewModel;
    return (
      <div class ={CSS.widgetInfoBar}>
        <svg height="25" width="25">
          <line x1="0" y1="12" x2="25" y2="12" style="stroke:rgb(255,0,0);stroke-width:4" />
        </svg>
        Steep slope &gt; { slopeThreshold}%
       
        <button onclick={this.exportImage}>Create Report</button>
      </div>
    );
  }
  start() {
    this.sketchVM.create('polyline');
  }

  exportImage() {
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
    this.mapView.map.add(graphicsLayer);
    this.sketchVM = new SketchViewModel({
      layer: graphicsLayer,
      view: this.mapView
    });
    this._DrawingComplete();
    this.createChart(dt);
  }


  private _DrawingComplete() {
    var that = this;
    this.sketchVM.on('create', function (evt: any) {
      if (evt.state === 'complete') {
        console.log(evt.graphic);
        that.viewModel.state = "loading";
        that.displayLineChart(evt.graphic);

      }
    })
  }

  private async displayLineChart(graphic: Graphic) {
    try {
      let elevationData = await this.viewModel.GetElevationData(graphic);
      this.viewModel.state = 'ready';
      let result = await elevationData.text();
      
      this.createChart(result);
    } catch (error) {
      this.viewModel.state = "Error";
      console.error(error);
    }
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
    let ptArray = JSON.parse(r) //result.results[0].value.features[0].geometry.paths[0];
    const [data, options] = this.viewModel.getChartData(r);
    this._renderChart(data, options);
    this.viewModel.initializeHover(ptArray, this.mapView);
  }

}

export = ElevationProfile;