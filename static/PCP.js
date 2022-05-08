function pcp(data) {
    var margin = {top: 20, right: 30, bottom: 0, left: 0};
//        width = 1600 - margin.left - margin.right,
//        height = 600 - margin.top - margin.bottom;
    var width = window.innerWidth * .4;
    var height = window.innerHeight * .45;

    var svg = d3.select("#pcp")
                .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    var dimensions = data.dimensions;
    var data_values = data.data_values;
    var label = data.label;
    var dragging = {}
    var foreground, background;

    var y = {};
    for (i in dimensions) {
        var name = dimensions[i];
        if (typeof data_values[0][name] === "number") {
            y[name] = d3.scaleLinear()
                .domain(d3.extent(data_values, d => +d[name]))
                .range([height, 0]);
        } else {
            y[name] = d3.scaleBand()
                .domain(data_values.map(d => d[name]))
                .range([height, 0]);
        }
        y[name].brush = d3.brushY()
                        .extent([[-10, y[name].range()[1]], [10, y[name].range()[0]]])
                        .on("brush", brush)
                        .on("start", brushstart)
                        .on("end", brush);
    }

    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(p => [position(p), typeof d[p] === "string" || typeof d[p] === "boolean" ? y[p](d[p]) + y[p].bandwidth()/2 : y[p](d[p])]));
    }

//    var lines = svg.selectAll("myPath")
//        .data(data_values)
//        .enter().append("path")
//        .attr("d", path)
//        .style("fill", "None")
//        .style("stroke", (d, i) => color[label[i]])
//        .style("opacity", 0.5);

    foreground = svg.append("g")
                    .attr("class", "foreground")
                    .selectAll("myPath")
                    .data(data_values)
                    .enter().append("path")
                    .attr("d", path);
//                    .style("fill", "None")
//                    .style("stroke", "#66ccff")
//                    .style("opacity", 0.5);

    var drag = d3.drag()
                .subject(function(d) { return {x: x(d)};})
                .on("start", function(e, d) {
                    dragging[d] = x(d);
                })
                .on("drag", function(e, d) {
                    dragging[d] = Math.min(width, Math.max(0, e.x));
                    foreground.attr("d", path);
                    dimensions.sort((a, b) => position(a) - position(b));
                    x.domain(dimensions);
                    g.attr("transform", d => "translate(" + position(d) + ")");
                })
                .on("end", function(e, d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                })

    var g = svg.selectAll("my_axis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", d => "translate(" + x(d) + ")")
        .attr("name", d => d)
        .call(drag);

    g.append("g")
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d]));})
        .append("text")
        .style("text-anchor", "middle")
        .style("font", "13px times")
        .attr("y", -9)
        .text(d => d)
        .style("fill", "black");

    g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this)
                .call(y[d].brush)
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    function brushstart(event) {
        event.sourceEvent.stopPropagation();
    }

    function brush() {
        var actives = [];
        svg.selectAll(".brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        foreground.classed("fade", function(d,i) {
            return !actives.every(function(active) {
                var dim = active.dimension;
                var position = typeof data_values[0][dim] === "string" ? y[dim](d[dim]) + y[dim].bandwidth()/2 : y[dim](d[dim]);
                return active.extent[0] <= position && position <= active.extent[1];
            });
        });
    }

//    svg.append("text")
//        .attr("x", width / 2)
//        .attr("y", -40)
//        .attr("text-anchor", "middle")
//        .style("font-size", "40px")
//        .text("Parallel Coordinates Plot")

//    svg.selectAll("dots")
//        .data(color)
//        .enter()
//        .append("circle")
//        .attr("cx", width - 40)
//        .attr("cy", function(d,i){ return i*25+40})
//        .attr("r", 7)
//        .style("fill", d => d)
//
//    svg.selectAll("labels")
//        .data(color)
//        .enter()
//        .append("text")
//        .attr("x", width - 20)
//        .attr("y", function(d,i){ return i*25+40})
//        .style("fill", d => d)
//        .text((d, i) => "cluster " + (i + 1))
//        .attr("text-anchor", "left")
//        .style("alignment-baseline", "middle")
}