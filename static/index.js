var color = ["#66ccff", "#69b3a2", "#404080", "yellow", "red"];
var color2 = ["yellow", "red", "violet", "orange", "green", "cyan", "blue"];

function read_data(url) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function (d) {
            if (url == '/barchart') {
                barchart(JSON.parse(d));
            } else if (url == '/stackedBarchart') {
                stackedBarchart(JSON.parse(d));
            } else if (url == '/pca') {
                pca(JSON.parse(d));
            } else if (url == '/stackedAreaChart') {
                stackedAreaChart(JSON.parse(d));
            } else if (url == '/pcp') {
                pcp(JSON.parse(d));
            } else if (url == '/geomap') {
                geomap(JSON.parse(d));
            }
        },
        error: function (d) {
            console.log(d);
        }
    });
}

function dashboard() {
    read_data('/geomap')
//    read_data('/pca')
    read_data('/barchart');
    read_data('/stackedBarchart');
    read_data('/stackedAreaChart');
    read_data('/pcp');
}

function geomap(transferred_data) {
    var width = 1200;
    var height = 800;

    var transferred_data = transferred_data.data;

    svg_geomap = d3.select('body')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

    var projection = d3.geoMercator().scale(170)
        .translate([width / 2, height / 1.4]);
    var path = d3.geoPath(projection);

    var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    var colorScale = d3.scaleThreshold()
                        .domain([0, 50000, 100000, 200000, 400000, 800000, 1200000, 2000000])
                        .range(d3.schemeReds[9]);

    svg_geomap.call(zoom);

    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(data => {
            var countries = data;

            svg_geomap.append("g")
                    .selectAll("path")
                    .data(countries.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("fill", d => {
                        total = transferred_data.hasOwnProperty(d.properties.name) ? transferred_data[d.properties.name].SALES : 0;
                        return colorScale(total);
                    })
                    .style("stroke", "transparent")
                    .attr("class", d => transferred_data.hasOwnProperty(d.properties.name) ? "country" : null)
                    .style("opacity", 0.8)
                    .on("mouseover", (d, i) => {
                        d3.selectAll(".country")
                            .transition()
                            .duration(200)
                            //.style("opacity", a => a.properties.name == i.properties.name ? 0.8 : 0.5)
                            .style("stroke", a => a.properties.name == i.properties.name ? "black" : "transparent")
                    })
                    .on("mouseleave", d => {
                        d3.selectAll(".country")
                            .transition()
                            .duration(200)
                            .style("opacity", .8)
                            .style("stroke", "transparent")
                    })
                    .on("click", (e, d) => {
                        if (transferred_data.hasOwnProperty(d.properties.name)) {
                            $.ajax({
                                url: "/stackedBarchart",
                                type: 'POST',
                                data: {
                                    country_name: d.properties.name
                                },
                                success: function (d) {
                                    stackedBarchart(JSON.parse(d));
                                },
                                error: function (d) {
                                    console.log(d);
                                }
                            });
                        }
                    });
    });

    function zoomed() {
        svg_geomap.selectAll('path')
        .attr('transform', d3.zoomTransform(this));
    }
}

function barchart(transferred_data, variable="CUSTOMERNAME") {
//    var variable_count = d3.rollups(data.data, v => d3.sum(v, d => d.SALES), d => d[variable])
//                    .sort(([, a], [, b]) => d3.descending(a, b))

    var data = transferred_data.data;

    var margin = {top: 100, right: 30, bottom: 50, left: 200},
        width = 650 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    svg_barchart = d3.select("#graph2")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
            .domain([0, d3.max(data.map(d => d.SALES))])
            .range([0, width]);

    svg_barchart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font", "14px times");

    var y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.CUSTOMERNAME))
            .padding(0.1);

    svg_barchart.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    svg_barchart.selectAll()
        .data(data)
        .join("rect")
        .attr("x", 1)
        .attr("y", d => y(d.CUSTOMERNAME))
        .attr("width", d => x(d.SALES))
        .attr("height", y.bandwidth)
        .attr("fill", "#66ccff")
        .on("click", function(d, e) {

        });

    svg_barchart.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "40px")
        .text("Barchart")

    svg_barchart.append("text")
        .attr("transform", "translate(" + (width + margin.left + margin.right) / 2 + ", " + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .style("font", "20px times")
        .text("counts")

    svg_barchart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2))
        .attr("y", -margin.left+10)
        .style("text-anchor", "middle")
        .style("font", "20px times")
        .text(variable)
}

function stackedBarchart(data) {
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 1600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    svg_time = d3.select("#graph3")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var subgroups = Object.keys(data[0]).slice(1)
    var groups = data.map(d => d.time_period)

    var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);

    svg_time.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
//        .tickSizeOuter(0)
        .style("font", "14px times");

    var maxY = 0;
    data.forEach(d => {
        var sum = 0;
        Object.keys(d).forEach(key => {
            if (key != "time_period") {
                sum += d[key];
            }
        })
        maxY = maxY > sum ? maxY : sum;
    });

    var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, maxY]);

    svg_time.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(d3.schemeSet3);

    var stackedData = d3.stack()
                        .keys(subgroups)
                        (data)

    svg_time.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("class", d => "time time" + d.data.time_period)
        .attr("x", d => x(d.data.time_period))
        .attr("y", d => y(d[0]))//y(d[1]))
        .attr("height", d => height-y(0))//y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("stroke", "gray")
        .on("mouseover", function(e, d) {
            var subGroupName = d3.select(this.parentNode).datum().key;
            //d3.selectAll(".myRect").style("opacity", 0.2);
            d3.selectAll(".time").style("opacity", 0.2);
            d3.selectAll(".time" + d.data.time_period).style("opacity", 1);//subGroupName.split(" ")[0]).style("opacity", 1);
        })
        .on("mouseleave", function(e, d) {
            d3.selectAll(".time")//myRect")
            .style("opacity", 1);
        });

        svg_time.selectAll("rect")
                .transition()
                .duration(500)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .delay((d, i) => i*15);
}

function stackedAreaChart(data) {
//    console.log(data);

    data.forEach(function(d) {
        d.date = d3.timeParse("%Y-%m-%d")(d.date);
    })

    const margin = {top: 60, right: 230, bottom: 50, left: 50},
          width = 1600 - margin.left - margin.right,
          height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#graph6")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                      `translate(${margin.left}, ${margin.top})`);

    // List of groups = header of the csv files
    const keys = Object.keys(data[0]).slice(1)//data.columns.slice(1)

    // color palette
    const color = d3.scaleOrdinal()
                    .domain(keys)
                    .range(d3.schemeSet3);

    //stack the data?
    const stackedData = d3.stack()
                        .keys(keys)
                        (data)

    // Add X axis
    const x = d3.scaleTime()
                .domain(d3.extent(data, function(d) { return d.date; }))
                .range([ 0, width ]);
    const xAxis = svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x))

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height+40 )
        .text("Time (year)");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("# of baby born")
        .attr("text-anchor", "start")

    // Add Y axis
    const y = d3.scaleLinear()
                .domain([0, 10000000])
                .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y))

    // Add a clipPath: everything out of this area won't be drawn.
    const clip = svg.append("defs")
                    .append("svg:clipPath")
                    .attr("id", "clip")
                    .append("svg:rect")
                    .attr("width", width )
                    .attr("height", height )
                    .attr("x", 0)
                    .attr("y", 0);

    // Add brushing
    const brush = d3.brushX()                 // Add the brush feature using the d3.brush function
                  .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                  .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    const areaChart = svg.append('g')
                        .attr("clip-path", "url(#clip)")

    // Area generator
    const area = d3.area()
                .x(function(d) { return x(d.data.date); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })

    // Show the areas
    areaChart.selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)

    // Add the brushing
    areaChart.append("g")
            .attr("class", "brush")
            .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart(event,d) {
        extent = event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function(d) { return d.date; }))
        } else {
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart.selectAll("path")
                .transition().duration(1000)
                .attr("d", area)
    }

    // What to do when one group is hovered
    const highlight = function(event,d){
        // reduce opacity of all groups
        d3.selectAll(".myArea").style("opacity", .1)
        // expect the one that is hovered
        d3.selectAll("."+d.split(" ")[0]).style("opacity", 1)
    }

    // And when it is not hovered anymore
    const noHighlight = function(event,d){
        d3.selectAll(".myArea").style("opacity", 1)
    }

    // Add one dot in the legend for each name.
    const size = 20
    svg.selectAll("myrect")
        .data(keys)
        .join("rect")
        .attr("x", 400)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .join("text")
        .attr("x", 400 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
}

function pca(transferred_data) {
    var xa = transferred_data.data.map(d => d[0]);
    var ya = transferred_data.data.map(d => d[1]);
    var projection = transferred_data.data;
    var label = transferred_data.label;

    var margin = {top: 50, right: 30, bottom: 50, left: 70},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    svg_pca = d3.select("#graph4")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(xa));

    svg_pca.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font", "14px times");

    var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(ya));

    svg_pca.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    svg_pca.selectAll()
        .data(projection)
        .join("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 2)
        .attr("fill", (d, i) => color[label[i]]);
}

function pcp(data) {
    var margin = {top: 70, right: 40, bottom: 10, left: 0},
        width = 1600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#graph5")
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

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "40px")
        .text("Parallel Coordinates Plot")

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

var svg_geomap, svg_barchart, svg_time, svg_pca;

dashboard();