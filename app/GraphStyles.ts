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

const CreateNormalElevationLine = (ptArray: any) => {
    return {
        x: ptArray.map((p: any) => p[3]),
        y: ptArray.map((p: any) => p[2]),
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
        title: {
          text: "Distance along profile (feet)",
          font: {
            size: 18,
            color: "#7f7f7f",
          },
        },
        showspikes: true,
        spikedash: 'solid',
        spikethickness: 1
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