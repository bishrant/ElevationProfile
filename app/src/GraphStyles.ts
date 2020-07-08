import { ElevationUnits } from './interfaces.d';
import { min, max } from "./Uitls";
const convertor = {
  meters: 1,
  feet: 3.281,
  kilometers: 0.001,
  miles: 1 / 1609,
  "nautical-miles": 1 / 1852,
  yards: 1.094,
};

const elevationUnitMap = {
  meters: "meters",
  feet: "feet",
  kilometers: "meters",
  miles: "feet",
  "nautical-miles": "feet",
  yards: "feet",
};
const lengthAbbrMap = {
  meters: "m.",
  feet: "ft.",
  kilometers: "km.",
  miles: "mi.",
  "nautical-miles": "n.m.",
  yards: "yd.",
};

const CreateHigherSlopeLine = (higherSlopeArray: any) => {
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
    hoverinfo: "skip",
  };
};

const ConvertElevationUnits = (ptArray0: any, unit: ElevationUnits) => {
  const ptArray = ptArray0.slice();
  const multiplier = convertor[elevationUnitMap[unit]];
  ptArray.forEach((p: any) => {
    p[2] = p[2] * multiplier;
  });
  return ptArray;
};

const CreateNormalElevationLine = (ptArray0: any, unit: ElevationUnits) => {
  const ptArray = ptArray0.slice();
  const abbr = elevationUnitMap[unit] === 'meters' ? 'm.' : 'ft.';
  const labbr = lengthAbbrMap[unit];
  return {
    x: ptArray.map((p: any) => p[3]),
    y: ptArray.map((p: any) => p[2]),
    customdata: ptArray.map((p: any) => [p[2] - ptArray[0][2], p[4]]),
    fill: "tozeroy",
    type: "scatter",
    mode: "markers+lines",
    m: ptArray.map((p: any) => p[2])[0],
    marker: {
      color: ptArray.map((p: any) => "transparent"),
    },
    name: "",
    text: "new line",
    fillcolor: "rgba(173,216,230,0.5)",
    line: {
      color: "rgb(0,0,0)",
      width: 2,
    },
    hovertemplate:
      "%{y:.2f} "+ abbr +" elevation<br>" +
      "%{x:.2f} "+ labbr +" from start<br>" +
      "%{customdata[0]:.2f} "+ abbr +" net elevation change<br>" +
      "%{customdata[1]:.2f}% forward slope",
  };
};

const GetGraphOptions = (ptArray: any, unit: ElevationUnits) => {
  const elev = ptArray.map((p: any) => p[2]);
  const abbr = elevationUnitMap[unit];
  const options = {
    hoverMode: "closest",
    hoverDistance: -1,
    hoveron: "points",
    showlegend: false,
    dragMode: false,
    displayModeBar: false,
    scrollZoom: false,
    width: 600,
    height: 340,
    margin: {
      l: 60,
      t: 10,
      r: 20,
      b: 10,
    },
    // staticPlot: true,
    plot_bgcolor: "rgba(0,0,0,0)",
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    hoverlabel: {
      bgcolor: "black",
      font: { color: "white" },
    },
    xaxis: {
      showgrid: false,
      fixedrange: true,
      automargin: true,
      standoff: 10,
      title: {
        text: "<b>Distance ("+unit+")</b>",
        standoff: 10,
        font: {
          size: 15,
          color: "black",
          family: '"Open Sans", verdana, arial, sans-serif;',
        },
      },
      showspikes: true,
      spikedash: "solid",
      spikethickness: 1,
    },
    yaxis: {
      range: [
        min(elev) > 100 ? min(elev) - 10 : min(elev) - 5,
        max(elev) > 100 ? max(elev) + 10 : max(elev) + 5,
      ],
      fixedrange: true,
      title: {
        text: "<b>Elevation (" + abbr + ")</b>",
        standoff: 1,
        font: {
          size: 15,
          color: "black",
          family: '"Open Sans", verdana, arial, sans-serif;',
        },
      },
    },
  };
  return options;
};

export {
  CreateHigherSlopeLine,
  CreateNormalElevationLine,
  GetGraphOptions,
  ConvertElevationUnits,
};
