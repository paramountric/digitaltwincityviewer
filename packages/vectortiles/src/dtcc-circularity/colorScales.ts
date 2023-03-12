// ! note that this file is copied from the project
// ! this should be refactored in a better way to generic modules
// ! the problem is that both indicators and color scale is very specific and colors are needed both in the application and for the tile separate generation code

const scales: {
  [scaleKey: string]: number[];
} = {
  buildingEnergy: [40, 60, 80, 108, 144, 188],
  districtEnergy: [25, 50, 75, 100, 125, 150],
  buildingGhg: [5, 7.5, 10, 13.5, 18, 23.5],
  districtGhg: [2.5, 5, 7.5, 10, 12.5, 15],
};

const universeumColors: number[][] = [
  [171, 213, 40],
  [98, 181, 38],
  [244, 246, 42],
  [244, 161, 108],
  [240, 72, 177],
  [88, 0, 237],
  [164, 36, 207],
];

// currently using the color scale from universeum
export function getColorFromScale(
  value: number,
  scaleKey = 'buildingEnergy',
  css = false // stringify for css use
) {
  const scale = scales[scaleKey] || scales.buildingEnergy;
  const color = universeumColors[universeumColors.length - 1];

  for (let i = 0; i < scale.length; i++) {
    if (value <= scale[i]) {
      const colorArray = universeumColors[i];
      if (css) {
        return `rgb(${colorArray.join(',')})`;
      }
      return colorArray;
    }
  }
  if (css) {
    return `rgb(${color.join(',')})`;
  }
  return color;
}

// use to display labels
export function getScaleRanges(scaleKey: string) {
  const scale = scales[scaleKey] || scales.energyDeclaration;
  const ranges = [];
  ranges.push([scale[scale.length - 1], '>']);
  for (let i = scale.length - 1; i >= 0; i--) {
    const prev = i ? scale[i - 1] : 0;
    ranges.push([prev, scale[i]]);
  }
  return ranges;
}
