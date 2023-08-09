
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
    const width = 640;
    const height = 500;
    console.log("fine")
    //create an svg containers

    const svg = d3.select("#svg-container")
      .append("svg") 
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto;"); 
      console.log("fine2")

    const links = data_links.map(d => ({...d}));
    const nodes = data_nodes.map(d => ({...d}));
    console.log("fine2.5")
    //create force simulation
    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
      console.log("fine3")

    //to show while loading
    const loading = svg.append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .text("Simulating. One moment please…");

    //display SVG immediately
    //yield svg.node();

    // Run the simulation to its end, then draw.
    simulation.tick(Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())));

    loading.remove();

    svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 4.5);






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

    //     // Show the description as a tooltip
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
     }