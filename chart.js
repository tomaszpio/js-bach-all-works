import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 600;
const radius = width / 6;

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
      const lines = [d.data.name];
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

  const hierarchy = d3.hierarchy(data)
      .sum(d => d.children ? 0 : 1)
      .sort((a, b) => b.value - a.value);

  const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);

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
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

  const path = g.append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
        .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr('fill-opacity', d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr('pointer-events', d => arcVisible(d.current) ? 'auto' : 'none')
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

  function arcLength(d) {
    const r = ((d.y0 + d.y1) / 2) * radius;
    return (d.x1 - d.x0) * r;
  }

  function wrapText(text, width) {
    text.each(function() {
      const textSel = d3.select(this);
      const words = textSel.text().split(/\s+/).filter(Boolean);
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1;
      let tspan = textSel.text(null).append('tspan').attr('x', 0).attr('dy', '0em');
      words.forEach(word => {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = textSel.append('tspan')
            .attr('x', 0)
            .attr('dy', `${++lineNumber * lineHeight}em`)
            .text(word);
        }
      });
    });
  }

  const label = g.append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1).filter(d => d.children))
      .join('text')
        .attr('dy', '0.35em');

  function updateLabels() {
    label
        .attr('fill-opacity', d => +labelVisible(d.current))
        .attr('transform', d => labelTransform(d.current))
        .text(d => d.data.name)
        .each(function(d) { wrapText(d3.select(this), arcLength(d.current)); });
  }

  updateLabels();

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
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = g.transition().duration(750);

    path.transition(t)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function(d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target);
        })
        .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr('pointer-events', d => arcVisible(d.target) ? 'auto' : 'none')
        .attrTween('d', d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute('fill-opacity') || labelVisible(d.target);
      }).transition(t)
        .attr('fill-opacity', d => +labelVisible(d.target))
        .attrTween('transform', d => () => labelTransform(d.current))
        .on('end', function(d) {
          wrapText(d3.select(this), arcLength(d.current));
        });
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.children && d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

});
