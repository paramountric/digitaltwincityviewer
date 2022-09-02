const scales: {
  [scaleKey: string]: number[];
} = {
  energyDeclaration: [40, 60, 80, 108, 144, 188],
  districtEnergy: [25, 50, 75, 100, 125, 150],
  buildingGhg: [5, 7.5, 10, 13.5, 18, 23.5],
  districtGhg: [2.5, 5, 7.5, 10, 12.5, 15],
};

// from better to worse kwh/m2 according to scales
const energyDeclarationColors: string[] = [
  '#009640',
  '#50AF31',
  '#C7D301',
  '#FFED00',
  '#FBB900',
  '#EC6707',
  '#E30613',
];

// currently using the color scale from swedish energy declaration
export function getColorFromScale(
  value: number,
  scaleKey = 'energyDeclaration'
) {
  const scale = scales[scaleKey] || scales.energyDeclaration;
  const color = energyDeclarationColors[energyDeclarationColors.length - 1];

  for (let i = 0; i < scale.length; i++) {
    if (value <= scale[i]) {
      return energyDeclarationColors[i];
    }
  }
  return color;
}

export function getScaleRanges(scaleKey: string) {
  const scale = scales[scaleKey] || scales.energyDeclaration;
  const ranges = [];
  for (let i = 0; i < scale.length; i++) {
    const prev = i ? scale[i - 1] : 0;
    ranges.push([prev, scale[i]]);
  }
  ranges.push([scale[scale.length - 1], '>']);
  return ranges;
}
