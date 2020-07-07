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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GraphicsLayer", "https://cdn.plot.ly/plotly-latest.min.js", "./Uitls", "./ElevationProfileViewModel", "./resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, SketchViewModel, GraphicsLayer, Plotly, Uitls_1, ElevationProfileViewModel, resources_1) {
    "use strict";
    Plotly = __importStar(Plotly);
    var ElevationProfile = /** @class */ (function (_super) {
        __extends(ElevationProfile, _super);
        function ElevationProfile(props) {
            var _this = _super.call(this) || this;
            _this.viewModel = new ElevationProfileViewModel();
            return _this;
        }
        ElevationProfile.prototype.render = function () {
            var _a = this.viewModel, slopeThreshold = _a.slopeThreshold, state = _a.state;
            return (widget_1.tsx("div", { class: this.classes(resources_1.CSS.esriWidget, resources_1.CSS.root) },
                widget_1.tsx("div", null, state === 'idle' ? null :
                    state === 'loading' ? this._renderLoader() :
                        this._renderElevationProfile()),
                widget_1.tsx("div", { id: "myDiv", class: this.classes({ 'elevation-profile__chart': state !== 'idle', 'elevation-profile__hidden': state !== 'ready' }) })));
        };
        ElevationProfile.prototype.postInitialize = function () {
            this.initSketchVM();
        };
        ElevationProfile.prototype._renderLoader = function () {
            return (widget_1.tsx("div", { class: this.classes(resources_1.CSS.chart, resources_1.CSS.loading) },
                widget_1.tsx("div", null, "Loading"),
                widget_1.tsx("img", { src: 'http://superstorefinder.net/support/wp-content/uploads/2018/01/blue_loading.gif', style: "width: 100px", alt: "loading" })));
        };
        ElevationProfile.prototype._renderElevationProfile = function () {
            var _a = this.viewModel, slopeThreshold = _a.slopeThreshold, state = _a.state;
            return (widget_1.tsx("div", { class: resources_1.CSS.widgetInfoBar },
                widget_1.tsx("svg", { height: "25", width: "25" },
                    widget_1.tsx("line", { x1: "0", y1: "12", x2: "25", y2: "12", style: "stroke:rgb(255,0,0);stroke-width:4" })),
                "Steep slope > ",
                slopeThreshold,
                "%",
                widget_1.tsx("button", { onclick: this.exportImage }, "Create Report")));
        };
        ElevationProfile.prototype.start = function () {
            this.sketchVM.create('polyline');
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
            this.mapView.map.add(graphicsLayer);
            this.sketchVM = new SketchViewModel({
                layer: graphicsLayer,
                view: this.mapView
            });
            this._DrawingComplete();
            this.createChart(Uitls_1.dt);
        };
        ElevationProfile.prototype._DrawingComplete = function () {
            var that = this;
            this.sketchVM.on('create', function (evt) {
                if (evt.state === 'complete') {
                    console.log(evt.graphic);
                    that.viewModel.state = "loading";
                    that.displayLineChart(evt.graphic);
                }
            });
        };
        ElevationProfile.prototype.displayLineChart = function (graphic) {
            return __awaiter(this, void 0, void 0, function () {
                var elevationData, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, this.viewModel.GetElevationData(graphic)];
                        case 1:
                            elevationData = _a.sent();
                            this.viewModel.state = 'ready';
                            return [4 /*yield*/, elevationData.text()];
                        case 2:
                            result = _a.sent();
                            this.createChart(result);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.viewModel.state = "Error";
                            console.error(error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
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
                "viewModel.slopeThreshold",
                "viewModel.state"
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