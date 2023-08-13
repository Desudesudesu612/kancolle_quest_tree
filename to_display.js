
import * as d3 from "https://unpkg.com/d3?module";


fetch('lists.json')
    .then(response => response.json())
    .then(data1 => {
        return fetch('./QuestList.json')
            .then(response => response.json())
            .then(data2 => {
                // console.log(data1);
                // console.log(data2);
                make_svg(data1, data2);
            });
    })
    .catch(error => {
        console.error('Error loading JSON data:', error);
    });

// fetch("lists.json")
// .then(res => res.json())
// .then(data => console.log(data))

 





function make_svg(data_links, data_nodes) {
    const width = 1000;
    const height = 600;
 
    //create an svg containers

    const svg = d3.select("#svg-container")
      .append("svg") 
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;")
      .call(d3.zoom()
      .scaleExtent([0.1, 4]) // Set your desired zoom range
      .on("zoom", zoomed)); 
    
    
    const g = svg.append("g");

    const links = data_links.map(d => ({...d}));
    const nodes = data_nodes.map(d => ({...d}));
    console.log("fine2.5")
    //create force simulation
    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("collide", d3.forceCollide().radius(d => d.r + 0.5).iterations(2))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);
      console.log("fine3")

    //to show while loading
    const loading = svg.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 100)
      .text("Simulating. One moment please…");

    //display SVG immediately
    //yield svg.node();

    // Run the simulation to its end, then draw.
    simulation.tick(Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())));

    loading.remove();

    const link = svg.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
    .selectAll("line")
    .data(links)
    .enter().append("line")
      // .attr("x1", (d) => d.source.x)
      // .attr("y1", (d) => d.source.y)
      // .attr("x2", (d) => d.target.x)
      // .attr("y2", (d) => d.target.y)
      .attr("marker-end", "url(#arrow)");

    
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 10)
            .attr("fill", d => d.color);

    svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 22) // Adjust based on your preference
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("class", "arrowhead"); // Apply CSS class for styling if needed        
      
      function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
      
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      }
      
    function zoomed() {
      g.attr("transform", d3.event.transform);
    }

  // Add text labels to the circles based on nodes' id
    // node.data(nodes)  // Bind data again (to existing circles)
    //     .append("text")  // Append a <text> element for each circle
    //         .attr("x", (d) => d.x)  // Adjust the x position as needed
    //         .attr("y", (d) => d.y)  // Adjust the y position as needed
    //         .attr("dy", -15)  // Offset the text above the circle
    //         .attr("text-anchor", "middle")  // Center the text horizontally
    //         .text((d) => d.id)  // Set the text content to the node's id
    //         .attr("fill", "#000")
    //         .attr("stroke", "none")
    //         .attr("font-size", "1");
    node.append("title")
      .text(d => d.id);
      
    node
    .attr('class', 'node')
    .on('mouseover', function (event, d) {

 node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));     



    //Show the description as a tooltip
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip.html(d.id)
        .style('left', event.pageX + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
    // Hide the tooltip
    tooltip.transition().duration(500).style('opacity', 0);
    });

// Create a tooltip element
const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

node;
link;
function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}
    // const nodeElements = svg.selectAll(".node")
    //     .data(nodes)
    //     .enter()
    //     .append('circle')
    //     .attr('class', 'node')
    //     .attr('r', 20)
    //     .attr('cx', (d, i) => i * 100 + 50)
    //     .attr('cy', 100)
    //     .attr('fill', 'steelblue')
    //     .on('mouseover', function (event, d) {

    //     //Show the description as a tooltip
    //     tooltip.transition().duration(200).style('opacity', 0.9);
    //     tooltip.html(d.description)
    //         .style('left', event.pageX + 'px')
    //         .style('top', (event.pageY - 28) + 'px');
    //     })
    //     .on('mouseout', function () {
    //     // Hide the tooltip
    //     tooltip.transition().duration(500).style('opacity', 0);
    //     });

    // // Create a tooltip element
    // const tooltip = d3.select('body')
    //     .append('div')
    //     .attr('class', 'tooltip')
    //     .style('opacity', 0);
    // nodeElements
     }