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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "./Uitls", "./GraphStyles", "esri/Graphic"], function (require, exports, __extends, __decorate, Accessor, decorators_1, Uitls_1, GraphStyles_1, Graphic) {
    "use strict";
    // import { ItemScoreViewModelProperties, Suggestion } from "./interfaces";
    var ElevationProfileViewModel = /** @class */ (function (_super) {
        __extends(ElevationProfileViewModel, _super);
        function ElevationProfileViewModel(props) {
            var _this = _super.call(this) || this;
            _this.ptArray = [];
            _this.state = "idle";
            return _this;
        }
        ElevationProfileViewModel.prototype.GetElevationData = function (graphic) {
            var feat = graphic.toJSON();
            feat.atttributes = { OID: 1 };
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            var urlencoded = new URLSearchParams();
            urlencoded.append("f", "json");
            urlencoded.append("returnZ", "true");
            urlencoded.append("DEMResolution", "FINEST");
            urlencoded.append("ProfileIDField", "ObjectID");
            //format
            var format = {
                fields: [{ name: "OID", type: "esriFieldTypeObjectID", alias: "OID" }],
                geometryType: "esriGeometryPolyline",
                features: [feat],
                sr: { wkid: 102100 },
            };
            urlencoded.append("InputLineFeatures", JSON.stringify(format));
            var requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: urlencoded,
                redirect: "follow",
            };
            return fetch("https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer/Profile/execute", requestOptions);
        };
        ElevationProfileViewModel.prototype.getChartData = function (r) {
            // const result = JSON.parse(r);
            var ptArray = JSON.parse(r); //result.results[0].value.features[0].geometry.paths[0];
            ptArray = Uitls_1.CalculateLength(ptArray);
            var normalLine = GraphStyles_1.CreateNormalElevationLine(ptArray);
            ptArray = Uitls_1.CalculateSlope(ptArray);
            var higherSlope = Uitls_1.GetSegmentsWithHigherSlope(ptArray, this.slopeThreshold);
            var higherSlopeLine = GraphStyles_1.CreateHigherSlopeLine(higherSlope);
            var data = [normalLine, higherSlopeLine];
            console.log(data);
            var options = GraphStyles_1.GetGraphOptions(ptArray);
            this.ptArray = ptArray;
            return [data, options];
        };
        ElevationProfileViewModel.prototype.initializeHover = function (ptArray, mapView) {
            var myPlot = document.getElementById("test");
            myPlot
                .on("plotly_hover", function (data) {
                var pId = data.points[0].pointIndex;
                var pt = ptArray[pId];
                var point = {
                    type: "point",
                    x: pt[0],
                    y: pt[1],
                    spatialReference: { wkid: 102100 },
                };
                // Create a symbol for drawing the point
                var markerSymbol = {
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
                .on("plotly_unhover", function (data) {
                mapView.graphics.removeAll();
            });
        };
        __decorate([
            decorators_1.property()
        ], ElevationProfileViewModel.prototype, "slopeThreshold", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfileViewModel.prototype, "plot", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfileViewModel.prototype, "ptArray", void 0);
        __decorate([
            decorators_1.property()
        ], ElevationProfileViewModel.prototype, "state", void 0);
        ElevationProfileViewModel = __decorate([
            decorators_1.subclass("esri.widgets.ElevationProfileViewModel")
        ], ElevationProfileViewModel);
        return ElevationProfileViewModel;
    }(decorators_1.declared(Accessor)));
    return ElevationProfileViewModel;
});
//# sourceMappingURL=ElevationProfileViewModel.js.map