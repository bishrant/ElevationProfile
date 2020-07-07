/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GraphicsLayer", "https://cdn.plot.ly/plotly-latest.min.js", "./Uitls", "./ElevationProfileViewModel"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, widget_1, SketchViewModel, GraphicsLayer, Plotly, Uitls_1, ElevationProfileViewModel) {
    "use strict";
    watchUtils = __importStar(watchUtils);
    Plotly = __importStar(Plotly);
    var ElevationProfile = /** @class */ (function (_super) {
        __extends(ElevationProfile, _super);
        function ElevationProfile(props) {
            var _this = _super.call(this) || this;
            _this.viewModel = new ElevationProfileViewModel();
            return _this;
        }
        ElevationProfile.prototype.render = function () {
            var slopeThreshold = this.viewModel.slopeThreshold;
            return (widget_1.tsx("div", null,
                "Steep slope >",
                slopeThreshold,
                "%",
                widget_1.tsx("button", { bind: this, onclick: this._startDrawing }, "Draw"),
                widget_1.tsx("div", { id: "myDiv", style: "height: 300px; width: 600px" }),
                widget_1.tsx("button", { onclick: this.exportImage }, "Create Report")));
        };
        ElevationProfile.prototype.postInitialize = function () {
            var _this = this;
            this.mapView.watch("center", function () { return _this._onViewChange(); });
            // this.mapView.on("click", function (event) {console.log(event) });
            watchUtils.init(this, "view.center, view.interacting, view.scale", function () { return _this._onViewChange(); });
            this.initSketchVM();
        };
        ElevationProfile.prototype.exportImage = function () {
            var myPlot = document.getElementById('myDiv');
            Plotly.toImage(myPlot, { height: 300, width: 300 })
                .then(function (url) {
                console.log(url);
            });
        };
        ElevationProfile.prototype.initSketchVM = function () {
            var graphicsLayer = new GraphicsLayer();
            this.map.add(graphicsLayer);
            this.sketchVM = new SketchViewModel({
                layer: graphicsLayer,
                view: this.mapView
            });
            this._DrawingComplete();
            this.createChart(Uitls_1.dt);
        };
        ElevationProfile.prototype._startDrawing = function () {
            this.sketchVM.create('polyline');
        };
        ElevationProfile.prototype._onViewChange = function () {
            var _a = this.mapView, interacting = _a.interacting, center = _a.center, scale = _a.scale;
            this.state = {
                x: center.x,
                y: center.y,
                interacting: interacting,
                scale: scale
            };
        };
        ElevationProfile.prototype._DrawingComplete = function () {
            var that = this;
            this.sketchVM.on('create', function (evt) {
                if (evt.state === 'complete') {
                    console.log(evt.graphic);
                    that.displayLineChart(evt.graphic);
                }
            });
        };
        ElevationProfile.prototype.send = function (feat) {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            var urlencoded = new URLSearchParams();
            urlencoded.append("f", "json");
            urlencoded.append("returnZ", "true");
            urlencoded.append("DEMResolution", "FINEST");
            urlencoded.append("ProfileIDField", "ObjectID");
            //format
            var format = {
                "fields": [{ "name": "OID", "type": "esriFieldTypeObjectID", "alias": "OID" }],
                "geometryType": "esriGeometryPolyline", "features": [feat], "sr": { "wkid": 102100 }
            };
            urlencoded.append("InputLineFeatures", JSON.stringify(format));
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
            };
            var that = this;
            fetch("https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute", requestOptions)
                .then(function (response) { return response.text(); })
                .then(function (result) {
                // that.createChart(result);
            })
                .catch(function (error) { return console.log('error', error); });
        };
        ElevationProfile.prototype._renderChart = function (data, options) {
            var that = this;
            Plotly.newPlot('test', data, options, { displayModeBar: false }).then(function (plot) {
                that.viewModel.plot = plot;
            });
            return null;
        };
        ElevationProfile.prototype.createChart = function (r) {
            // const result = JSON.parse(r);
            var ptArray = JSON.parse(r); //result.results[0].value.features[0].geometry.paths[0];
            var _a = this.viewModel.getChartData(r), data = _a[0], options = _a[1];
            this._renderChart(data, options);
            this.viewModel.initializeHover(ptArray, this.mapView);
        };
        ElevationProfile.prototype.displayLineChart = function (graphic) {
            var g = graphic.toJSON();
            g.atttributes = { 'OID': 1 };
            this.send(g);
        };
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "map", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ElevationProfile.prototype, "state", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "sketchVM", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "plot", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable([
                "viewModel.slopeThreshold"
            ])
        ], ElevationProfile.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.slopeThreshold")
        ], ElevationProfile.prototype, "slopeThreshold", void 0);
        ElevationProfile = __decorate([
            decorators_1.subclass("esri.widgets.ElevationProfile")
        ], ElevationProfile);
        return ElevationProfile;
    }(decorators_1.declared(Widget)));
    return ElevationProfile;
});
//# sourceMappingURL=ElevationProfile.js.map