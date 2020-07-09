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
import { dt, CalculateLength, CalculateSlope, lengthAbbrMap, max, min, avg, CalculateSegmentLength, sum, Decimal, elevationUnitMap } from "./Uitls";
import ElevationProfileViewModel = require("./ElevationProfileViewModel");
import { ElevationProfileProperties, ElevationUnits } from "./interfaces";
import { CSS } from './resources';
import { ConvertElevationUnits } from "./GraphStyles";

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
  unit: ElevationUnits = 'miles';

  @property()
  private reveresed: boolean = false;

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
        <div id="myDiv" class={this.classes({ 'elevation-profile__chart': state !== 'idle', 'elevation-profile__hidden': state !== 'ready' })}></div>
        <div>
          {state === 'idle' ? null :
            state === 'loading' ? this._renderLoader() :
              this._renderElevationProfile()
          }
        </div>
      </div>
    );
  }

  postInitialize() {
    this.initSketchVM();
  }



  GetStatistics() {
    let pts = JSON.parse(JSON.stringify(this.viewModel.ptArrayOriginal));
    pts = ConvertElevationUnits(pts, this.unit);
    pts = CalculateLength(pts, this.unit);
    pts = CalculateSlope(pts);
    pts = CalculateSegmentLength(pts, this.unit);

    const unitAbbr = " "+ lengthAbbrMap[this.unit];
    const elevAbbr = " "+ lengthAbbrMap[elevationUnitMap[this.unit]];
    console.log(pts);
    const totalDistance = pts[pts.length-1][3];
    const slopes = pts.map((p: any) => p[4]);
    const steepSlopes = pts.filter((s: any) => s[4] > this.slopeThreshold).map((p: any) => p[5]);
    const elevation = pts.map((p: any) => p[2]);
    const elvBase = elevation[0];
    const elevationDiff = elevation.map((p: any) => (p - elvBase));
    
    const elevationGain = sum(elevationDiff.filter((d: any) => d>0));
    const elevationLoss = sum(elevationDiff.filter((d: any) => d<0));
    // gets the stats needed for PLMO report
    return {
      TotalDistance: totalDistance + unitAbbr,
      MaximumSlope: max(slopes) + '%',
      MinimumSlope: min(slopes) + '%',
      MeanSlope: Decimal(avg(slopes)) + '%',
      SteepSlopes: sum(steepSlopes) + unitAbbr,
      ElevationRange: Math.abs(Decimal(max(elevation) - min(elevation))) + elevAbbr,
      MinimumElevation: Decimal(min(elevation)) + elevAbbr,
      MaximumElevation:  Decimal(max(elevation)) + elevAbbr,
      TotalElevationGain: Decimal(elevationGain) + elevAbbr,
      TotalElevationLost: Decimal(elevationLoss) + elevAbbr,
    }
  }

  createReport() {
    console.log({
      summaryStats: this.GetStatistics(),
      image:  this.exportImage()
    });
  }

  private _renderLoader() {
    return (
      <div class={this.classes(CSS.chart, CSS.loading)}>
        <div>Loading</div>
        <img src='http://superstorefinder.net/support/wp-content/uploads/2018/01/blue_loading.gif' style="width: 100px" alt="loading" />
      </div>
    );
  }

  private _renderElevationProfile() {
    const { slopeThreshold } = this.viewModel;
    const classes = {
      [CSS.fas]: true,
      [CSS.leftArrow]: !this.reveresed,
      [CSS.rightArrow]: this.reveresed
    }
    return (
      <div class={CSS.widgetInfoBar}>
        <div>
          <span class="slopeIndicator">
            <svg height="25" width="25">
              <line x1="0" y1="12" x2="25" y2="12" style="stroke:rgb(255,0,0);stroke-width:4" />
            </svg>
            &nbsp;&nbsp;Steep slope &gt; {slopeThreshold}%
          </span>
        </div>
        <div class='chartBottomBar'>
          <button bind={this} onclick={this.reverseProfile} class="profileDirection" title="reveser">
            <i class={this.classes(classes)} title="reveser"></i>
          </button>
          <button bind={this} onclick={this.exit} class="profileDirection" title="reveser">
            <i class='fa fa-times-circle' title="reveser"></i>
          </button>
        <span class="createreportBar">
          <b> Project Name: </b><input type="text" /><button bind={this} onclick={this.createReport}>Create Report</button>
          </span>
          </div>
      </div>


    );
  }

  start() {
    this.sketchVM.create('polyline');
  }

  reverseProfile() {
    this.reveresed = !this.reveresed;
    const div = document.getElementById('myDiv') as any;
    Plotly.purge('myDiv');
    div.outerHTML = div.outerHTML;
    
    let reversedPtArray = JSON.parse(JSON.stringify(this.viewModel.ptArrayOriginal));
    let reveresedArrayNew;
    if (this.reveresed) {
      reveresedArrayNew = JSON.parse(JSON.stringify(reversedPtArray.reverse()));
    } else {
      reveresedArrayNew = JSON.parse(JSON.stringify(this.viewModel.ptArrayOriginal));
    }
    const [data, options, ptArrayNew] = this.viewModel.getChartData(reveresedArrayNew, this.unit);
    this._renderChart(data, options);
    // console.log(reveresedArrayNew);
    this.viewModel.initializeHover(Plotly, ptArrayNew, this.mapView);
    reveresedArrayNew = undefined;
    reversedPtArray = undefined;
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
      const ptArray = resultJson.results[0].value.features[0].geometry.paths[0]
      this.viewModel.ptArrayOriginal = ptArray.slice();
      this.createChart(ptArray.slice());
    } catch (error) {
      this.viewModel.state = "Error";
      console.error(error);
    }
  }


  protected _renderChart(data: any[], options: any): any {
    Plotly.react('myDiv', data, options, { displayModeBar: false, responsive: true, autosize: true });
  }

  private createChart(dd: any) {
    this.viewModel.state = 'ready';
    let d = JSON.parse(JSON.stringify(dd));
    let [data, options, ptArrayNew] = this.viewModel.getChartData(d, this.unit);
    this._renderChart(data, options);
    this.viewModel.initializeHover(Plotly, ptArrayNew, this.mapView);
    d = null;
    [data, options, ptArrayNew] = [null,null,null];
  }


  startTest() {
    // this.render();
    setTimeout(()=>{ 
      let rj = JSON.parse(dt);
      let _ptArray = rj.results[0].value.features[0].geometry.paths[0];
      _ptArray = _ptArray.map((p: any) => [Decimal(p[0]),Decimal(p[1]),Decimal(p[2])]);
      this.viewModel.ptArrayOriginal  = JSON.parse(JSON.stringify(_ptArray));
      this.createChart(_ptArray);
      rj = null;
      _ptArray = null;
     }, 10);
  }

  exit() {
    const div = document.getElementById('myDiv') as any;
    div.outerHTML = div.outerHTML;
    Plotly.purge('myDiv');
    this.viewModel.ptArrayOriginal = null;
    this.destroy();
  }


}

export = ElevationProfile;