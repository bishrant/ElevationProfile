define(["require", "exports", "./Uitls"], function (require, exports, Uitls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CreateHigherSlopeLine = function (higherSlopeArray) {
        return {
            x: higherSlopeArray[0],
            y: higherSlopeArray[1],
            fill: 'tozeroy',
            type: 'scatter',
            fillcolor: 'transparent',
            line: {
                color: 'rgb(255,0,0)',
                width: 3
            },
            marker: {
                color: 'transparent'
            }
        };
    };
    exports.CreateHigherSlopeLine = CreateHigherSlopeLine;
    var CreateNormalElevationLine = function (ptArray) {
        return {
            x: ptArray.map(function (p) { return p[3]; }),
            y: ptArray.map(function (p) { return p[2]; }),
            fill: 'tozeroy',
            type: 'scatter',
            marker: {
                color: 'transparent'
            },
            fillcolor: 'lightblue',
            line: {
                color: 'rgb(0,0,0)',
                width: 2
            },
        };
    };
    exports.CreateNormalElevationLine = CreateNormalElevationLine;
    var GetGraphOptions = function (ptArray) {
        var elev = ptArray.map(function (p) { return p[2]; });
        var options = {
            hoverMode: 'closest',
            hoverDistance: -1,
            hoveron: "points",
            yaxis: { range: [Uitls_1.min(elev) * 0.9, Uitls_1.max(elev) * 1.1] }
        };
        return options;
    };
    exports.GetGraphOptions = GetGraphOptions;
});
//# sourceMappingURL=GraphStyles.js.map