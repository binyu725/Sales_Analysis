var color = ["#66ccff", "#69b3a2", "#404080", "yellow", "red"];
//var color2 = {"Wines": "yellow", "Fruits": "red", "Meat": "violet", "Fish": "orange", "Sweets": "green", "Gold": "cyan"};

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
            }
        },
        error: function (d) {
            console.log(d);
        }
    });
}

function dashboard() {
    geomap();
    read_data('/pca')
    read_data('/barchart');
    read_data('/stackedBarchart');
}

function geomap() {
    const width = 600;
    const height = 400;

    const svg = d3.select('body')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

    const projection = d3.geoMercator().scale(95)
        .translate([width / 2, height / 1.4]);
    const path = d3.geoPath(projection);

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(data => {
            const countries = topojson.feature(data, data.objects.countries);
            svg.append("g")
            .selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#66ccff")
            .style("stroke", "transparent")
            .attr("class", d => "country")
            .style("opacity", 0.8)
            .on("mouseover", (d, i) => {
                d3.selectAll(".country")
                    .transition()
                    .duration(200)
                    .style("opacity", a => a.properties.name == i.properties.name ? 0.8 : 0.5)
                    .style("stroke", a => a.properties.name == i.properties.name ? "black" : "transparent")
            })
            .on("mouseleave", d => {
                d3.selectAll(".country")
                    .transition()
                    .duration(200)
                    .style("opacity", .8)
                    .style("stroke", "transparent")
            });
        });
}

function barchart(data, variable="COUNTRY") {
    var variable_count = d3.rollups(data.data, v => d3.sum(v, d => d.SALES), d => d[variable])
                    .sort(([, a], [, b]) => d3.descending(a, b))

    var margin = {top: 100, right: 30, bottom: 50, left: 115},
        width = 500 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var svg = d3.select("#graph2")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
            .domain([0, d3.max(variable_count.map(d => d[1]))])
            .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font", "14px times");

    var y = d3.scaleBand()
            .range([0, height])
            .domain(variable_count.map(d => d[0]))
            .padding(0.1);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    svg.selectAll()
        .data(variable_count)
        .join("rect")
        .attr("x", 1)
        .attr("y", d => y(d[0]))
        .attr("width", d => x(d[1]))
        .attr("height", y.bandwidth)
        .attr("fill", "#66ccff");

    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "40px")
        .text("Barchart")

    svg.append("text")
        .attr("transform", "translate(" + (width + margin.left + margin.right) / 2 + ", " + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .style("font", "20px times")
        .text("counts")

    svg.append("text")
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

    var svg = d3.select("#graph3")
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

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
//        .tickSizeOuter(0)
        .style("font", "14px times");

    var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 11000]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(d3.schemeSet2);

    var stackedData = d3.stack()
                        .keys(subgroups)
                        (data)

    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.time_period))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("stroke", "gray")
        .on("mouseover", function(e, d) {
            var subGroupName = d3.select(this.parentNode).datum().key
            d3.selectAll(".myRect").style("opacity", 0.2);
            d3.selectAll("." + subGroupName.split(" ")[0]).style("opacity", 1);
        })
        .on("mouseleave", function(e, d) {
            d3.selectAll(".myRect")
            .style("opacity", 1);
        });
}

function pca(transferred_data) {
    var xa = transferred_data.data.map(d => d[0]);
    var ya = transferred_data.data.map(d => d[1]);
    var projection = transferred_data.data;
    var label = transferred_data.label;

    var margin = {top: 50, right: 30, bottom: 50, left: 70},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#graph4")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(xa));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font", "14px times");

    var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(ya));

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    svg.selectAll()
        .data(projection)
        .join("circle")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 2)
        .attr("fill", (d, i) => color[label[i]]);
}

dashboard();