import * as d3 from "https://unpkg.com/d3?module";

fetch('lists.json')
    .then(response => response.json())
    .then(data1 => {
        return fetch('./QuestList.json')
            .then(response => response.json())
            .then(data2 => {
                make_svg(data1, data2);
            });
    })
    .catch(error => {
        console.error('Error loading JSON data:', error);
    });






function make_svg(data_links, data_nodes) {
    const width = window.innerWidth;
    const height = window.innerHeight;
 
    
    const links = data_links.map(d => ({...d}));
    const nodes = data_nodes.map(d => ({...d}));

    //create force simulation
    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);
      console.log("fine3")

    const svg = d3.select("#svg-container")
      .append("svg") 
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    

    
    

    
     const g = svg.append("g");
     console.log(g);
    const link = g
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("marker-end", "url(#arrow)");
    
      const nodeGroup = g
      .append("g")
      .attr("stroke", "#014")
      .attr("stroke-width", 1.5)
      .selectAll(".nodeGroup")
      .data(nodes)
      .enter()
      .append("g");

      const node = nodeGroup
        .append("circle")
        .attr("r", 20)
        .attr("fill", d => d.color)
        .call(d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        );
            
        nodeGroup
		.append("text")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.attr("fill", "black") // or any color you prefer
		.text((d) => d.id);

    //for style of arrow
    nodeGroup.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 30) // Adjust based on your preference
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
        // node
        //   .attr("cx", d => d.x)
        //   .attr("cy", d => d.y);

        nodeGroup.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      }

    

  
    

    node.append("title")
      .text(d => d.id);

    
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


	const zoomHandler = d3.zoom().on("zoom", (event) => {
		g.attr("transform", event.transform);
	});

	svg.call(zoomHandler);

	simulation.on("end", () => {
		const bbox = g.node().getBBox();
		const scale = Math.min(width / bbox.width, height / bbox.height);
		const translate = [
			width / 2 - scale * (bbox.x + bbox.width / 2),
			height / 2 - scale * (bbox.y + bbox.height / 2),
		];

		svg.transition()
			.duration(750)
			.call(
				zoomHandler.transform,
				d3.zoomIdentity
					.translate(translate[0], translate[1])
					.scale(scale)
			);
	});
  invalidation.then(() => simulation.stop());
     }