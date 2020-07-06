import { min, max } from "./Uitls";

const CreateHigherSlopeLine = (higherSlopeArray: any) => {
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
    }
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
        hoverMode: 'closest',
        hoverDistance: -1,
        hoveron: "points",
        yaxis: { range: [min(elev) * 0.9, max(elev) * 1.1] }
    };
    return options;
}

export { CreateHigherSlopeLine, CreateNormalElevationLine, GetGraphOptions }