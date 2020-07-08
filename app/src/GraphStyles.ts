import { min, max } from "./Uitls";

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

const CreateNormalElevationLine = (ptArray0: any) => {
  const ptArray = ptArray0.slice();
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
      "%{y:.2f} ft elevation<br>" +
      "%{x:.2f} mi from start<br>" +
      "%{customdata[0]:.2f} ft net elevation change<br>" +
      "%{customdata[1]:.2f}% forward slope",
  };
};

const GetGraphOptions = (ptArray: any) => {
  const elev = ptArray.map((p: any) => p[2]);
  const options = {
    hoverMode: "closest",
    hoverDistance: -1,
    hoveron: "points",
    showlegend: false,
    dragMode: false,
    displayModeBar: false,
    scrollZoom: false,
    // staticPlot: true,
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    hoverlabel: {
      bgcolor: "black",
      font: { color: "white" },
    },
    xaxis: {
      showgrid: false,
      fixedrange: true,
      title: {
        text: "Distance along profile (feet)",
        font: {
          size: 18,
          color: "black",
          family: '"Open Sans", verdana, arial, sans-serif;',
        },
      },
      showspikes: true,
      spikedash: "solid",
      spikethickness: 1,
    },
    yaxis: {
      range: [min(elev) * 0.95, max(elev) * 1.05],
      fixedrange: true,
      title: {
        text: "Elevation (feet)",
        font: {
          size: 18,
          color: "black",
          family: '"Open Sans", verdana, arial, sans-serif;',
        },
      },
    },
  };
  return options;
};

export { CreateHigherSlopeLine, CreateNormalElevationLine, GetGraphOptions };
