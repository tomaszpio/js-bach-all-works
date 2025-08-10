import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 600;
const radius = width / 2;

Promise.all([
  fetch('liturgical_year.json').then(r => r.json()),
  fetch('works.json').then(r => r.json())
]).then(([data, works]) => {
  const worksMap = new Map(works.map(d => [d.BWV, d.Title]));
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  function getTitle(name) {
    const match = name.match(/^BWV\s*(\d+)([a-z])?$/i);
    if (!match) return '';
    const num = match[1].padStart(4, '0');
    const suffix = match[2] || '';
    return worksMap.get(num + suffix) || '';
  }

  function nodePath(d, includeLeaf = true) {
    const names = d.ancestors().reverse().map(n => n.data.name).slice(1);
    if (!includeLeaf) names.pop();
    return names.join(' → ');
  }

  function tooltipText(d) {
    if (d.children) {
      const lines = [nodePath(d)];
      d.leaves().forEach(leaf => {
        const title = getTitle(leaf.data.name);
        lines.push(`${leaf.data.name}${title ? ' – ' + title : ''}`);
      });
      return lines.join('\n');
    } else {
      const title = getTitle(d.data.name);
      const path = nodePath(d, false);
      const workLine = `${d.data.name}${title ? ' – ' + title : ''}`;
      return path ? `${path}\n${workLine}` : workLine;
    }
  }

  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  const partition = data => d3.partition()
      .size([2 * Math.PI, radius])
    (d3.hierarchy(data)
      .sum(d => d.children ? 0 : 1)
      .sort((a, b) => b.value - a.value));

  const root = partition(data);
  root.each(d => d.current = d);

  const svg = d3.select('#chart')
      .attr('viewBox', [0, 0, width, width])
      .style('font', '8px sans-serif');

  const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${width / 2})`);

  const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - 1);

  const path = g.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
        .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr('fill-opacity', d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr('d', d => arc(d.current))
        .on('mousemove', (event, d) => {
          tooltip.style('opacity', 1)
                 .html(tooltipText(d).replace(/\n/g, '<br/>'))
                 .style('left', (event.pageX + 10) + 'px')
                 .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', () => tooltip.style('opacity', 0));

  path.append('title')
      .text(d => tooltipText(d));

  path.filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', clicked);

  const parent = g.append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.y0),
      y1: Math.max(0, d.y1 - p.y0)
    });

    const t = g.transition().duration(750);

    path.transition(t)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
      .attrTween('d', d => () => arc(d.current));
  }

  function arcVisible(d) {
    return d.y1 <= radius && d.y0 >= 0 && d.x1 > d.x0;
  }

});
