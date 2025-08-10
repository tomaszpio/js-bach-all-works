fetch('timeline_data.json')
  .then(response => response.json())
  .then(data => {
    const eventsData = data.filter(d => d.event && d.event.trim() !== '');

    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 1000 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select('#timeline')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(eventsData, d => d.year))
      .range([0, width]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'timeline-tooltip')
      .style('display', 'none');

    svg.selectAll('circle')
      .data(eventsData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.year))
      .attr('cy', height / 2)
      .attr('r', 4)
      .attr('fill', 'steelblue')
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`<strong>${d.year}</strong>: ${d.event}`)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => tooltip.style('display', 'none'));
  });
