function geomap(transferred_data) {
    d3.select("#map").select("svg").remove();

    var width = window.innerWidth * .35;
    var height = window.innerHeight * .45;

    var transferred_data = transferred_data.data;

    var svg_geomap = d3.select("#map")
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

    var projection = d3.geoMercator().scale(100)
        .translate([width / 2, height / 1.4]);
    var path = d3.geoPath(projection);

    var zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);

    var colorScale = d3.scaleThreshold()
                        .domain([0, 50000, 100000, 200000, 400000, 800000, 1200000, 2000000])
                        .range(d3.quantize(d3.interpolateLab("#FFFFFF", "#363062"), 9));//d3.schemeReds[9]);

    // var data_arr = Object.entries(transferred_data);
    // var colorScale = d3.scaleLinear()
    //     .domain(d3.extent(data_arr.map(d => d[1].SALES)))
    //     .range(["#d66000", "#a9a9b4"])
    //     .interpolate(d3.interpolateLab);

    svg_geomap.call(zoom);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
                .attr("class", d => transferred_data.hasOwnProperty(d.properties.name) ? "country" : "others")
                .style("opacity", d => transferred_data.hasOwnProperty(d.properties.name) ? 1 : (selectedQuarter === "" ? 1 : 0))
                .on("mouseover", (e, d) => {
                    var transferred_data_var = transferred_data
                    //const [x_point, y_point] = d3.pointer(d);
                    var x_point = e.x + 10;
                    var y_point = e.y + 10;

                    if (d.properties.name in transferred_data_var) {
                        if (selectedCountry === "") {
                            d3.selectAll(".country")
                                .transition("mouseover_map").duration(300)
                                .style("opacity", a => a.properties.name == d.properties.name ? 1 : 0.3)
                                .style("stroke", a => a.properties.name == d.properties.name ? "black" : "transparent")
                        }
                        tooltip.style("left", (x_point) + "px")
                            .style("top", (y_point) + "px")
                            .transition("tip")
                            .duration(400)
                            .style("opacity", 1)
                            .text(d.properties.name + ": " + transferred_data_var[d.properties.name].SALES);
                    }
                })
                .on("mousemove", (d, i) => {
                    //const [x_point, y_point] = d3.pointer(d);
                    var x_point = d.x + 10;
                    var y_point = d.y + 10;
                    tooltip.style("left", (x_point) + "px")
                        .style("top", (y_point) + "px");
                })
                .on("mouseleave", d => {
                    if (selectedCountry === "") {
                        d3.selectAll(".country")
                            .transition("mouseleave_map").duration(300)
                            .style("opacity", 1)
                            .style("stroke", "transparent");
                    }
                    tooltip.transition("tip").duration(300)
                        .style("opacity", 0);
                })
                .on("click", (e, d) => {
                    tooltip.transition("tip").duration(300)
                        .style("opacity", 0);
                    if (transferred_data.hasOwnProperty(d.properties.name)) {
                        if (selectedCountry === d.properties.name) {
                            selectedCountry = "";
                            var iscustomer = document.getElementById("customer").checked;
                            postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
                        } else {
                            selectedCountry = d.properties.name;
                            d3.selectAll(".country")
                                .transition("click_map").duration(300)
                                .style("opacity", a => a.properties.name == d.properties.name ? 1 : 0.3)
                                .style("stroke", a => a.properties.name == d.properties.name ? "black" : "transparent")
                        }

                        if (selectedQuarter === "" && selectedProduct === "") {
                            var isbarchart = document.getElementById("Bar").checked;
                            postData(isbarchart ? "/stackedBarchart" : '/stackedAreaChart');
                        }

                        if (selectedCustomer === "") {
                            postData("/barchart");
                        }

                        if (selectedQuarter === "" && selectedCustomer === "") {
                            var iscustomer = document.getElementById("customer").checked;
                            postData(iscustomer ? "/growthRate" : "/salesGrowthRate");
                        }

                        if (checkAllEmpty()) {
                            postData("/geomap");
                        }
                    }
                });

        const x = d3.scaleLinear()
            .domain([2.6, 75.1])
            .rangeRound([600, 860]);

        const legend = svg_geomap.append("g")
            .attr("id", "legend");

        const legend_entry = legend.selectAll("g.legend")
            .data(colorScale.range().map(function (d) {
                d = colorScale.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("g")
            .attr("class", "legend_entry");

        const legend_square_size = 10;


        legend_entry.append("rect")
            .attr("x", 25)
            .attr("y", function (d, i) {
                return height - (i * legend_square_size) - 2 * legend_square_size;
            })
            .attr("width", legend_square_size)
            .attr("height", legend_square_size)
            .style("fill", function (d) {
                return colorScale(d[0]);
            })
            .style("opacity", 0.8);

        legend_entry.append("text")
            .attr("x", 40)
            .attr("y", function (d, i) {
                return height - (i * legend_square_size) - legend_square_size - 2;
            })
            .text(function (d, i) {
                if (i === 0) return "< " + d[1] / 1000000 + "M";
                if (d[1] < d[0]) return d[0] / 1000000 + "M +";
                return d[0] / 1000000 + "M - " + d[1] / 1000000 + "M";
            })
            .style("font-size", "10px");

        legend.append("text")
            .attr("x", 25)
            .attr("y", 310)
            .text("Sales (Million)")
            .style("font-size", "10px");
    });

    function zoomed() {
        svg_geomap.selectAll('path')
        .attr('transform', d3.zoomTransform(this));
    }
}