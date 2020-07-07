define(["require", "exports", "./Uitls"], function (require, exports, Uitls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CreateHigherSlopeLine = function (higherSlopeArray) {
        return {
            x: higherSlopeArray[0],
            y: higherSlopeArray[1],
            fill: "tozeroy",
            type: "scatter",
            fillcolor: "transparent",
            line: {
                color: "rgb(255,0,0)",
                width: 3,
            },
            marker: {
                color: "transparent",
            },
            hoverinfo: "skip"
        };
    };
    exports.CreateHigherSlopeLine = CreateHigherSlopeLine;
    var CreateNormalElevationLine = function (ptArray0) {
        var ptArray = ptArray0.slice();
        return {
            x: ptArray.map(function (p) { return p[3]; }),
            y: ptArray.map(function (p) { return p[2]; }),
            customdata: ptArray.map(function (p) { return [p[2] - ptArray[0][2], p[4]]; }),
            fill: "tozeroy",
            type: "scatter",
            m: ptArray.map(function (p) { return p[2]; })[0],
            marker: {
                color: "transparent",
            },
            name: "",
            text: "new line",
            fillcolor: "rgba(173,216,230,0.5)",
            line: {
                color: "rgb(0,0,0)",
                width: 2,
            },
            hovertemplate: "%{y:.2f} ft altitude<br>" +
                "%{x:.2f} mi from start<br>" +
                "%{customdata[0]:.2f} ft elevation change<br>" +
                "%{customdata[1]:.2f}% forward slope",
        };
    };
    exports.CreateNormalElevationLine = CreateNormalElevationLine;
    var GetGraphOptions = function (ptArray) {
        var elev = ptArray.map(function (p) { return p[2]; });
        var options = {
            hoverMode: "closest",
            hoverDistance: -1,
            hoveron: "points",
            showlegend: false,
            staticPlot: true,
            displayModeBar: false,
            xaxis: {
                showgrid: false,
                title: {
                    text: "Distance along profile (feet)",
                    font: {
                        size: 18,
                        color: "#7f7f7f",
                    },
                },
                showspikes: true,
                spikedash: "solid",
                spikethickness: 1,
            },
            yaxis: {
                range: [Uitls_1.min(elev) * 0.9, Uitls_1.max(elev) * 1.1],
                title: {
                    text: "Elevation (feet)",
                    font: {
                        size: 18,
                        color: "#7f7f7f",
                    },
                },
            },
        };
        return options;
    };
    exports.GetGraphOptions = GetGraphOptions;
});
//# sourceMappingURL=GraphStyles.js.map