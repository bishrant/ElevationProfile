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
      hoverinfo: "skip"
    };
}

const CreateNormalElevationLine = (ptArray0: any) => {
  const ptArray = ptArray0.slice();
    return {
      x: ptArray.map((p: any) => p[3]),
      y: ptArray.map((p: any) => p[2]),
      customdata: ptArray.map((p: any) => [p[2] - ptArray[0][2], p[4]]),
      fill: "tozeroy",
      type: "scatter",
      m: ptArray.map((p: any) => p[2])[0],
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
      hovertemplate:
        "%{y:.2f} ft altitude<br>" +
        "%{x:.2f} mi from start<br>" +
        "%{customdata[0]:.2f} ft elevation change<br>" +
        "%{customdata[1]:.2f}% forward slope",
    };
}


const GetGraphOptions = (ptArray: any) => {
    const elev = ptArray.map((p: any) => p[2]);
    const options = {
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
        range: [min(elev) * 0.9, max(elev) * 1.1],

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
}

export { CreateHigherSlopeLine, CreateNormalElevationLine, GetGraphOptions }