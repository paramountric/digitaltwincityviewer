import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { toJS } from 'mobx';
import { customElement, property, query } from 'lit/decorators.js';
import { select, selectAll } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';

@customElement('dte-bottom-panel')
class BottomPanel extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 1;
      bottom: 5px;
      padding-left: 5px;
      opacity: 0.95;
      width: 100%;
    }
  `;

  @query('#barchart')
  _barchart;

  @property({ type: Object })
  public timelineData;

  @property({ type: Boolean })
  public showTimelinePerM2;

  @property({ type: String })
  public label;

  willUpdate(): void {
    if (this._barchart) {
      const timelineDataKey = this.showTimelinePerM2 ? 'perM2' : 'total';
      const timelineValues = this.timelineData[timelineDataKey];
      this.renderChart(toJS(timelineValues));
    }
  }

  renderChart(timelineValues: number[]) {
    select(this._barchart).selectAll('svg').remove();
    const max = Math.max(...timelineValues);
    if (max === 0) {
      return;
    }
    const min = Math.min(...timelineValues);

    const margin = { top: 20, right: 20, bottom: 40, left: 100 };
    const width =
      this._barchart.getBoundingClientRect().width - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var x = scaleBand().domain(months).range([0, width]).padding(0.5);
    var y = scaleLinear().domain([0, max]).range([height, 0]);

    var colorScale = scaleLinear()
      .domain([min, max])
      .range(['#eff3ff', '#2171b5']);

    const svg = select(this._barchart)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    svg
      .selectAll('.bar')
      .data(timelineValues)
      .enter()
      .append('rect')
      .attr('fill', d => colorScale(d))
      .attr('stroke', '#999')
      .attr('class', 'bar')
      .attr('x', function (d, i) {
        return x(months[i]);
      })
      .attr('width', x.bandwidth())
      .attr('y', function (d) {
        return y(d);
      })
      .attr('height', function (d) {
        return height - y(d);
      });

    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(axisBottom(x));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(this.label);

    svg.append('g').call(axisLeft(y));
  }

  render(): TemplateResult {
    return html`<div><div id="barchart"></div></div>`;
  }
}

export { BottomPanel };
