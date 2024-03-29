function stackedBarchart(data) {
    d3.select("#timeseries").select("svg").remove();

    var margin = {top: 50, right: 10, bottom: 40, left: 70};
//        width = 600 - margin.left - margin.right,
//        height = 300 - margin.top - margin.bottom;
    var width = window.innerWidth * .6 - margin.left - margin.right;
    var height = window.innerHeight * .4 - margin.top - margin.bottom;

    var svg_time = d3.select("#timeseries")
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
                .range(d3.schemeSet3);//d3.quantize(d3.interpolateLab("#878ECD", "#363062"), 7));

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
        .attr("stroke", "transparent")
        .style("opacity", 1)
        .on("mouseover", function(e, d) {
            //var subGroupName = d3.select(this.parentNode).datum().key;
            //d3.selectAll(".myRect").style("opacity", 0.2);
            if (selectedQuarter === "") {
                d3.selectAll(".time")
                    .transition("mouseover").duration(300)
                    .style("opacity", 0.3)
                    .attr("stroke", "transparent");
                d3.selectAll(".time" + d.data.time_period)
                    .transition("mouseover").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "gray");
                //subGroupName.split(" ")[0]).style("opacity", 1);
            }
        })
        .on("mouseleave", function(e, d) {
            if (selectedQuarter === "") {
                d3.selectAll(".time")//myRect")
                    .transition("mouseleave").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "transparent");
            }
        })
        .on("click", function(e, d) {
            if (selectedQuarter === d.data.time_period) {
                selectedQuarter = "";
            } else {
                selectedQuarter = d.data.time_period;
                d3.selectAll(".time")
                    .transition("click").duration(300)
                    .style("opacity", 0.3)
                    .attr("stroke", "transparent");
                d3.selectAll(".time" + d.data.time_period)
                    .transition("click").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "gray");
            }
            if (selectedCountry === "") {
                postData("/geomap");
            }
            if (selectedCustomer === "") {
                postData("/barchart");
            }
            if (selectedQuarter === "" && selectedCustomer === "") {
                var iscustomer = document.getElementById("customer").checked;
                postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
            }
            if (checkAllEmpty()) {
                postData("/stackedBarchart");
            }
        });

    svg_time.selectAll("rect")
            .transition("start")
            .duration(500)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .delay((d, i) => i*5);

    const highlight = function(event, d){
        if (selectedProduct === "") {
            d3.selectAll(".myRect")
                .transition("highlight").duration(300)
                .style("opacity", 0.2);
            d3.selectAll("." + d.split(" ")[0])
                .transition("highlight").duration(300)
                .style("opacity", 1)
                .attr("stroke", "gray");
        }
    }

    // And when it is not hovered anymore
    const noHighlight = function(event, d){
        if (selectedProduct === "") {
            d3.selectAll(".myRect")
                .transition("nohighlight").duration(300)
                .style("opacity", 1)
                .attr("stroke", "transparent");
        }
    }

    var subgroups_reverse = subgroups.reverse();

    const size = 10;
    svg_time.selectAll("myrect")
        .data(subgroups_reverse)
        .join("rect")
        .attr("x", 950)
        .attr("y", function(d,i){ return 10 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        .on("click", function(e, d) {
            if (selectedProduct === d) {
                selectedProduct = "";
            } else {
                selectedProduct = d;
                d3.selectAll(".myRect")
                    .transition("click").duration(300)
                    .style("opacity", 0.2);
                d3.selectAll("." + d.split(" ")[0])
                    .transition("click").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "gray");
            }
            if (selectedCountry === "") {
                postData("/geomap");
            }
            if (selectedCustomer === "") {
                postData("/barchart");
            }
            if (selectedQuarter === "" && selectedCustomer === "") {
                var iscustomer = document.getElementById("customer").checked;
                postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
            }
            if (checkAllEmpty()) {
                postData("/stackedBarchart");
            }
        });

    // Add one dot in the legend for each name.
    svg_time.selectAll("mylabels")
        .data(subgroups_reverse)
        .join("text")
        .attr("x", 950 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("stroke", "purple")
        .style("stroke-width", ".2px")
        .style("stroke-linejoin", "round")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        .on("click", function(e, d) {
            if (selectedProduct === d) {
                selectedProduct = "";
            } else {
                selectedProduct = d;
                d3.selectAll(".myRect")
                    .transition("click").duration(300)
                    .style("opacity", 0.2);
                d3.selectAll("." + d.split(" ")[0])
                    .transition("click").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "gray");
            }
            if (selectedCountry === "") {
                postData("/geomap");
            }
            if (selectedCustomer === "") {
                postData("/barchart");
            }
            if (selectedQuarter === "" && selectedCustomer === "") {
                var iscustomer = document.getElementById("customer").checked;
                postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
            }
            if (checkAllEmpty()) {
                postData("/stackedBarchart");
            }
        });

    svg_time.append("text")
        .attr("x", (width) / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-family", "serif")
        .style("font-weight", "bold ")
        .text("TIMESERIES")

    svg_time.append("text")
        .attr("transform", "translate(" + (width) + ", " + (height + 37) + ")")
        .style("text-anchor", "end")
        .style("font", "18px times")
        .text("Time(Quarter)")

    svg_time.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font", "18px times")
        .text("Sales")
}

function stackedAreaChart(data) {
    d3.select("#timeseries").select("svg").remove();

    data.forEach(function(d) {
        d.date = d3.timeParse("%Y-%m-%d")(d.date);
    })

    const margin = {top: 50, right: 10, bottom: 40, left: 70};
//          width = 600 - margin.left - margin.right,
//          height = 300 - margin.top - margin.bottom;
    var width = window.innerWidth * .6 - margin.left - margin.right;
    var height = window.innerHeight * .4 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#timeseries")
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
                    .range(d3.schemeSet3);//d3.quantize(d3.interpolateLab("#a9a9b4", "#363062"), 7));

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
                    .style("font", "14px times");

    svg.append("text")
       .attr("x", (width) / 2)
       .attr("y", -30)
       .attr("text-anchor", "middle")
       .style("font-size", "25px")
       .style("font-family", "serif")
       .style("font-weight", "bold ")
       .text("NET SALES");

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height+30 )
        .style("font", "18px times")
        .text("Time");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .style("font", "18px times")
        .text("Cumulative Sales")
        .attr("text-anchor", "middle")

    var maxY = 0;
    Object.keys(data[data.length-1]).forEach(key => {
        if (key != "date") {
            maxY += data[data.length-1][key];
        }
    })

    // Add Y axis
    const y = d3.scaleLinear()
                .domain([0, maxY])
                .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

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

    areaChart.selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", d3.area()
                .x(function(d) { return x(d.data.date); })
                .y0(function(d) { return y(0); })
                .y1(function(d) { return y(0); })
            )
            .transition("a")
            .duration(800)
            .attr("d", area)
            .delay(80);

    // Add the brushing
    areaChart.append("g")
            .attr("class", "brush")
            .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart(event,d) {
        extent = event.selection;

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
        if (selectedProduct === "") {
            d3.selectAll(".myArea")
                .transition("highlight").duration(300)
                .style("opacity", .1)
            d3.selectAll("." + d.split(" ")[0])
                .transition("highlight").duration(300)
                .style("opacity", 1)
        }
    }

    // And when it is not hovered anymore
    const noHighlight = function(event,d){
        if (selectedProduct === "") {
            d3.selectAll(".myArea")
                .transition("nohighlight").duration(300)
                .style("opacity", 1)
        }
    }

    // Add one dot in the legend for each name.
    const size = 10;
    var keys_reverse = keys.reverse();

    svg.selectAll("myrect")
        .data(keys_reverse)
        .join("rect")
        .attr("x", 100)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        .on("click", function(e, d) {
            if (selectedProduct === d) {
                selectedProduct = "";
            } else {
                selectedProduct = d;
                d3.selectAll(".myArea")
                    .transition("click").duration(300)
                    .style("opacity", 0.1);
                d3.selectAll("." + d.split(" ")[0])
                    .transition("click").duration(300)
                    .style("opacity", 1);
            }

            if (selectedCountry === "") {
                postData("/geomap");
            }
            if (selectedCustomer === "") {
                postData("/barchart");
            }
            if (selectedQuarter === "" && selectedCustomer === "") {
                var iscustomer = document.getElementById("customer").checked;
                postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
            }
            if (checkAllEmpty()) {
                postData("/stackedAreaChart");
            }
        });

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys_reverse)
        .join("text")
        .attr("x", 100 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("stroke", "purple")
        .style("stroke-width", ".2px")
        .style("stroke-linejoin", "round")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
        .on("click", function(e, d) {
            if (selectedProduct === d) {
                selectedProduct = "";
            } else {
                selectedProduct = d;
                d3.selectAll(".myArea")
                    .transition("click").duration(300)
                    .style("opacity", 0.1);
                d3.selectAll("." + d.split(" ")[0])
                    .transition("click").duration(300)
                    .style("opacity", 1);
            }

            if (selectedCountry === "") {
                postData("/geomap");
            }
            if (selectedCustomer === "") {
                postData("/barchart");
            }
            if (selectedQuarter === "" && selectedCustomer === "") {
                var iscustomer = document.getElementById("customer").checked;
                postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
            }
            if (checkAllEmpty()) {
                postData("/stackedAreaChart");
            }
        });
}