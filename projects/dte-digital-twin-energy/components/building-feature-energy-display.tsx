import {select} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {getColorFromScale} from '../lib/colorScales';

// all properties in the attribute object will be shown, labels are taken from here
const propertyLabels = {
  deliveredEnergy: 'Delivered energy',
  deliveredEnergy2020: 'Delivered energy 2020',
  deliveredEnergy2030: 'Delivered energy 2030',
  deliveredEnergy2050: 'Delivered energy 2050',
  primaryEnergy: 'Primary energy',
  primaryEnergy2020: 'Primary energy 2020',
  primaryEnergy2030: 'Primary energy 2030',
  primaryEnergy2050: 'Primary energy 2050',
  finalEnergy: 'Final energy',
  finalEnergy2020: 'Final energy 2020',
  finalEnergy2030: 'Final energy 2030',
  finalEnergy2050: 'Final energy 2050',
  ghgEmissions: 'GHG emissions',
  ghgEmissions2020: 'GHG emissions 2020',
  ghgEmissions2030: 'GHG emissions 2030',
  ghgEmissions2050: 'GHG emissions 2050',
  heatDemand: 'Heat demand',
  heatDemand2020: 'Heat demand 2020',
  heatDemand2030: 'Heat demand 2030',
  heatDemand2050: 'Heat demand 2050',
};

// these are the units, but could be done with enum instead
const units = {
  deliveredEnergy: 'kWh',
  deliveredEnergy2020: 'kWh',
  deliveredEnergy2030: 'kWh',
  deliveredEnergy2050: 'kWh',
  primaryEnergy: 'kWh',
  primaryEnergy2020: 'kWh',
  primaryEnergy2030: 'kWh',
  primaryEnergy2050: 'kWh',
  finalEnergy: 'kWh',
  finalEnergy2020: 'kWh',
  finalEnergy2030: 'kWh',
  finalEnergy2050: 'kWh',
  ghgEmissions: 'kgCO2-eq.',
  ghgEmissions2020: 'kgCO2-eq.',
  ghgEmissions2030: 'kgCO2-eq.',
  ghgEmissions2050: 'kgCO2-eq.',
  heatDemand: 'kWh',
  heatDemand2020: 'kWh',
  heatDemand2030: 'kWh',
  heatDemand2050: 'kWh',
};

// if needs to be rounded
const rounding = {
  height: 1,
  heatedFloorArea: 0,
  deliveredEnergy: 0,
  deliveredEnergy2020: 0,
  deliveredEnergy2030: 0,
  deliveredEnergy2050: 0,
  primaryEnergy: 0,
  primaryEnergy2020: 0,
  primaryEnergy2030: 0,
  primaryEnergy2050: 0,
  finalEnergy: 0,
  finalEnergy2020: 0,
  finalEnergy2030: 0,
  finalEnergy2050: 0,
  ghgEmissions: 0,
  ghgEmissions2020: 0,
  ghgEmissions2030: 0,
  ghgEmissions2050: 0,
  heatDemand: 0,
  heatDemand2020: 0,
  heatDemand2030: 0,
  heatDemand2050: 0,
};

const properties: string[] = [];
const key = 'finalEnergy';

function formatValue(properties, propertyKey) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

function getIndicatorYears(key: string) {
  const y2020 = properties[`${key}2020M2`] || 0;
  const y2030 = properties[`${key}2030M2`] || 0;
  const y2050 = properties[`${key}2050M2`] || 0;
  return [y2020, y2030, y2050];
}

type DisplayProps = {};

// Given a certain building, show energy charts for that building
const BuildingFeatureEnergyDisplay: React.FC<DisplayProps> = () => {
  return (
    <div>
      <div id={`indicator-display-${key}`}></div>
      <table className="mb-1">
        <tbody>
          {properties.map(key => {
            const val = formatValue(properties, key);
            return (
              <tr key={key}>
                <td>{propertyLabels[key] || 'fixme'}:</td>
                <td>
                  ${val || '-'} ${units[key] || ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BuildingFeatureEnergyDisplay;

//   @property({type: Object})
//   public properties;

//   @property({type: String})
//   public key;

// if (!this.properties) {
//   return null;
// }
// const {key} = this;
// const isGhg = key === 'ghgEmissions';
// const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

// const el = this.shadowRoot;
// select(el).selectAll('svg').remove();
// const timelineValues = this.getIndicatorYears(key);
// const max = Math.max(...timelineValues);
// if (max === 0) {
//   return;
// }
// const years = ['2020', '2030', '2050'];
// const properties = years.map(year => `${key}${year}`);

// const margin = {top: 20, right: 0, bottom: 20, left: 0};
// const width = 250;
// const height = 80 - margin.top - margin.bottom;
// const x = scaleBand().domain(years).range([0, width]).padding(0.5);
// const y = scaleLinear().domain([0, max]).range([height, 0]);

// const svg = select(el)
//   .append('svg')
//   .attr('width', width + margin.left + margin.right)
//   .attr('height', height + margin.top + margin.bottom)
//   .append('g')
//   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
// svg
//   .selectAll('.bar')
//   .data(timelineValues)
//   .enter()
//   .append('rect')
//   .attr('fill', d => getColorFromScale(d, scaleKey))
//   .attr('stroke', '#999')
//   .attr('class', 'bar')
//   .attr('x', function (d, i) {
//     return x(years[i]);
//   })
//   .attr('width', x.bandwidth())
//   .attr('y', function (d) {
//     return y(d);
//   })
//   .attr('height', function (d) {
//     return height - y(d);
//   });

// svg
//   .append('text')
//   .attr('x', width / 2)
//   .attr('y', 0 - margin.top / 2)
//   .attr('text-anchor', 'middle')
//   .style('font-size', '12px')
//   .style('text-decoration', 'underline')
//   .text(propertyLabels[key]);

// svg
//   .append('g')
//   .attr('transform', 'translate(0,' + height + ')')
//   .call(axisBottom(x));

// svg.append('g').call(axisLeft(y));
