function growthRate(data) {
    var margin = {top: 0, right: 0, bottom: 35, left: 30};
//        width = 650 - margin.left - margin.right,
//        height = 350 - margin.top - margin.bottom;
    var width = window.innerWidth * .4;
    var height = window.innerHeight * .45;

    var svg = d3.select("#growthrate")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
            .domain(Object.keys(data))
            .range([0, width])
            .padding(0.2);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("font", "12px times");

    var y = d3.scaleLinear()
            .range([height, 0])
            .domain([d3.min(Object.values(data)), d3.max(Object.values(data))])
            .nice();

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "14px times");

    var data_arr = Object.entries(data);
    svg.selectAll()
        .data(data_arr)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(Math.max(0, d[1])))
        .attr("width", x.bandwidth)
        .attr("height", d => Math.abs(y(0) - y(d[1])))
        .attr("fill", "#66ccff")
        .on("click", function(d, e) {

        });
}