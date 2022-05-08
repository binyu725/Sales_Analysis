function geomap(transferred_data) {
    var width = window.innerWidth * .4;
    var height = window.innerHeight * .5;

    var transferred_data = transferred_data.data;

    svg_geomap = d3.select("#map")
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

    var projection = d3.geoMercator().scale(120)
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
                            $.ajax({
                                url: "/barchart",
                                type: 'POST',
                                data: {
                                    country_name: d.properties.name
                                },
                                success: function (d) {
                                    barchart(JSON.parse(d));
                                },
                                error: function (d) {
                                    console.log(d);
                                }
                            });
                            $.ajax({
                                url: "/growthRate",
                                type: 'POST',
                                data: {
                                    country_name: d.properties.name
                                },
                                success: function (d) {
                                    growthRate(JSON.parse(d));
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