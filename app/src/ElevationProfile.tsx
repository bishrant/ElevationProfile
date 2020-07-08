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
  reveresed: boolean = false;

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



  GetStatistics() {
// gets the stats needed for PLMO report
    // required outputs include 
    // Total Distance: 20.7 mi
    // Maximum Slope: 11.3 %
    //   Minimum Slope: 0 %
    //     Mean Slope: 2.4 %
    //       Steep Slopes(> 8 %): 2 mi
    // Elevation Range: 376 ft
    // Minimum Elevation: 2, 262 ft
    // Maximum Elevation: 2, 637 ft
    // Total Elevation Gain: 1, 301 ft
    // Total Elevation Lost: 1, 312 ft
    return {
      TotalDistance: 0,
      MaximumSlope: 0,
      MinimumSlope: 0,
      MeanSlope: 0,
      SteepSlopes: 0,
      ElevationRange: 0,
      MinimumElevation: 0,
      MaximumElevation: 0,
      TotalElevationGain: 0,
      TotalElevationLost: 0

    }
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
    const classes = {
      [CSS.fas]: true,
      [CSS.leftArrow]: !this.reveresed,
      [CSS.rightArrow]: this.reveresed
    }
    return (
      <div class ={CSS.widgetInfoBar}>
        <svg height="25" width="25">
          <line x1="0" y1="12" x2="25" y2="12" style="stroke:rgb(255,0,0);stroke-width:4" />
        </svg>
        Steep slope &gt; { slopeThreshold}%
       
        <button onclick={this.exportImage}>Create Report</button>
        <button bind={this} onclick={this.reverseProfile} class="profileDirection" title="reveser">
          <i class={this.classes(classes)} title="reveser"></i>
        </button>
      </div>
    );
  }

  start() {
    this.sketchVM.create('polyline');
  }

  reverseProfile() {
    this.reveresed = !this.reveresed;
    let reversedPtArray = this.viewModel.ptArray.slice();
    reversedPtArray.reverse();
    reversedPtArray  = reversedPtArray.map((r: any) => [r[0], r[1], r[2]]);
    this.createChart(reversedPtArray);
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
    
  }


  private _DrawingComplete() {
    var that = this;
    this.sketchVM.on('create', function (evt: any) {
      if (evt.state === 'complete') {
        console.log(evt.graphic);
        that.viewModel.userGraphic = evt.graphic;
        that.displayLineChart(evt.graphic);
      }
    })
  }

  private async displayLineChart(graphic: Graphic) {
    this.viewModel.state = "loading";
    try {
      let elevationData = await this.viewModel.GetElevationData(graphic);
      
      const result = await elevationData.text();
      const resultJson = JSON.parse(result);
      const ptArray = resultJson.results[0].value.features[0].geometry.paths[0];
      this.createChart(ptArray);
    } catch (error) {
      this.viewModel.state = "Error";
      console.error(error);
    }
  }


  protected _renderChart(data: any[], options: any): any {
    let that = this;
    Plotly.newPlot('myDiv', data, options, { displayModeBar: false, responsive: true, }).then(function (plot: any) {
      that.viewModel.plot = plot;
    })
    return null;
  }

  private createChart(ptArray: any) {
    this.viewModel.state = 'ready';
    // const result = JSON.parse(r);
    // let ptArray = result.results[0].value.features[0].geometry.paths[0];
    const [data, options, ptArrayNew] = this.viewModel.getChartData(ptArray);
    this._renderChart(data, options);
    this.viewModel.initializeHover(Plotly, ptArrayNew, this.mapView);
    this.viewModel.ptArray = ptArrayNew;
  }

  startTest() {
    const resultJson = JSON.parse(dt);
    const ptArray = resultJson.results[0].value.features[0].geometry.paths[0];
    this.createChart(ptArray);
  }

}

export = ElevationProfile;