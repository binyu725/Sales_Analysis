function barchart(transferred_data, variable="CUSTOMERNAME") {
//    var variable_count = d3.rollups(data.data, v => d3.sum(v, d => d.SALES), d => d[variable])
//                    .sort(([, a], [, b]) => d3.descending(a, b))

    var data = transferred_data.data;

    var margin = {top: 0, right: 30, bottom: 30, left: 50};
//        width = 650 - margin.left - margin.right,
//        height = 350 - margin.top - margin.bottom;
    var width = window.innerWidth * .2;
    var height = window.innerHeight * .45;


    svg_barchart = d3.select("#top-5")
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

//    svg_barchart.append("text")
//        .attr("x", (width + margin.left + margin.right) / 2)
//        .attr("y", -30)
//        .attr("text-anchor", "middle")
//        .style("font-size", "40px")
//        .text("Barchart")
//
//    svg_barchart.append("text")
//        .attr("transform", "translate(" + (width + margin.left + margin.right) / 2 + ", " + (height + margin.bottom) + ")")
//        .style("text-anchor", "middle")
//        .style("font", "20px times")
//        .text("counts")
//
//    svg_barchart.append("text")
//        .attr("transform", "rotate(-90)")
//        .attr("x", -(height/2))
//        .attr("y", -margin.left+10)
//        .style("text-anchor", "middle")
//        .style("font", "20px times")
//        .text(variable)
}