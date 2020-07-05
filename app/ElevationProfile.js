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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/geometry/Polyline", "esri/geometry/geometryEngine"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, widget_1, SketchViewModel, GraphicsLayer, Graphic, Polyline, geometryEngine_1) {
    "use strict";
    watchUtils = __importStar(watchUtils);
    var ElevationProfile = /** @class */ (function (_super) {
        __extends(ElevationProfile, _super);
        function ElevationProfile(params) {
            return _super.call(this) || this;
            // this._onViewChange = this._onViewChange.bind(this);
        }
        ElevationProfile.prototype.postInitialize = function () {
            var _this = this;
            this.mapView.watch("center", function () { return _this._onViewChange(); });
            // this.mapView.on("click", function (event) {console.log(event) });
            watchUtils.init(this, "view.center, view.interacting, view.scale", function () { return _this._onViewChange(); });
            this.initSketchVM();
        };
        ElevationProfile.prototype.render = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("button", { bind: this, onclick: this._startDrawing }, "Draw"),
                widget_1.tsx("div", { id: "myDiv", style: "height: 300px; width: 600px" })));
        };
        ElevationProfile.prototype.initSketchVM = function () {
            var graphicsLayer = new GraphicsLayer();
            this.map.add(graphicsLayer);
            this.sketchVM = new SketchViewModel({
                layer: graphicsLayer,
                view: this.mapView
            });
            this._DrawingComplete();
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
            // myHeaders.append("Access-Control-Allow-Credentials", "true");
            // myHeaders.append("Access-Control-Allow-Origin", "http://localhost:4501");
            // myHeaders.append("Cookie", "AGS_ROLES=\"419jqfa+uOZgYod4xPOQ8Q==\"; AWSELB=2D7D79D118CF06FE55F3FE32B215F683FD69AAD5B71D10B50FF8BC5EED565120D0BDD53770A2473F86F08B1123AB8951C1F07DFAF2C75669499EF31ED6E1F9477C89C85FA3; AWSELBCORS=2D7D79D118CF06FE55F3FE32B215F683FD69AAD5B71D10B50FF8BC5EED565120D0BDD53770A2473F86F08B1123AB8951C1F07DFAF2C75669499EF31ED6E1F9477C89C85FA3");
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
                that.createChart(result);
            })
                .catch(function (error) { return console.log('error', error); });
        };
        ElevationProfile.prototype.distance = function (a, b) {
            return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[0] - b[0]) * (a[0] - b[0]));
        };
        ElevationProfile.prototype.createChart = function (r) {
            var that = this;
            new Promise(function (resolve_1, reject_1) { require(['https://cdn.plot.ly/plotly-latest.min.js'], resolve_1, reject_1); }).then(__importStar).then(function (Plotly) {
                var result = JSON.parse(r);
                var ptArray = result.results[0].value.features[0].geometry.paths[0];
                for (var i in ptArray) {
                    if (parseInt(i) === 0) {
                        console.log(" 0 length");
                        ptArray[i].push(0);
                    }
                    else {
                        var myArray = ptArray.slice().splice(0, parseInt(i) + 1);
                        var line = new Polyline({
                            hasZ: true,
                            // hasM: true,
                            paths: [myArray],
                            spatialReference: { wkid: 102100 }
                        });
                        var l = geometryEngine_1.planarLength(line, "miles");
                        ptArray[i].push(l);
                        console.log(l, myArray.length, i);
                    }
                }
                var l1 = new Polyline({
                    hasZ: true,
                    // hasM: true,
                    paths: [ptArray],
                    spatialReference: { wkid: 102100 }
                });
                var le = geometryEngine_1.planarLength(l1, "miles");
                console.log("TOTAL ", le);
                var trace1 = {
                    x: ptArray.map(function (p, i) { return p[3]; }),
                    y: ptArray.map(function (p) { return p[2]; }),
                    fill: 'tonexty',
                    type: 'scatter'
                };
                var data = [trace1];
                console.log(ptArray);
                var options = {
                    hoverMode: 'closest',
                    hoverDistance: -1,
                    hoveron: "points"
                };
                Plotly.newPlot('myDiv', data, options);
                var myPlot = document.getElementById('myDiv');
                myPlot.on('plotly_hover', function (data) {
                    console.log(data.points[0]);
                    var pId = data.points[0].pointIndex;
                    var pt = ptArray[pId];
                    var point = {
                        type: "point",
                        x: pt[0],
                        y: pt[1],
                        spatialReference: { wkid: 102100 }
                    };
                    // Create a symbol for drawing the point
                    var markerSymbol = {
                        type: "simple-marker",
                        style: "cross",
                        color: "cyan"
                    };
                    // Create a graphic and add the geometry and symbol to it
                    var pointGraphic = new Graphic({
                        geometry: point,
                        symbol: markerSymbol
                    });
                    console.log(pt);
                    that.mapView.graphics.removeAll();
                    that.mapView.graphics.add(pointGraphic);
                })
                    .on('plotly_unhover', function (data) {
                    that.mapView.graphics.removeAll();
                });
            });
        };
        ElevationProfile.prototype.displayLineChart = function (graphic) {
            console.log(graphic.toJSON());
            var g = graphic.toJSON();
            g.atttributes = { 'OID': 1 };
            this.send(g);
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ElevationProfile.prototype, "state", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ElevationProfile.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "sketchVM", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfile.prototype, "map", void 0);
        ElevationProfile = __decorate([
            decorators_1.subclass("esri.widgets.ElevationProfile")
        ], ElevationProfile);
        return ElevationProfile;
    }(decorators_1.declared(Widget)));
    return ElevationProfile;
});
//# sourceMappingURL=ElevationProfile.js.map