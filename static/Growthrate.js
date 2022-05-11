function growthRate(data) {
    d3.select("#growthrate").select("svg").remove();

    var margin = {top: 30, right: 10, bottom: 35, left: 40};
//        width = 650 - margin.left - margin.right,
//        height = 350 - margin.top - margin.bottom;
    var width = window.innerWidth * .4 - margin.left - margin.right;
    var height = window.innerHeight * .45 - margin.top - margin.bottom;

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
        .style("font", "12px times");

    var data_arr = Object.entries(data);

    var selectedDate = "";

    svg.selectAll()
        .data(data_arr)
        .join("rect")
        .attr("class", d => "dates")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth)
        .attr("height", d => Math.abs(height - y(d3.min(Object.values(data)))))
        .attr("fill", "#947EC3")
        .on("mouseover", function(e, d) {
            if (selectedDate === "") {
                d3.selectAll(".dates")
                    .transition().duration(300)
                    .style("opacity", a => a[0] == d[0] ? 1 : 0.3)
                    .attr("stroke", a => a[0] == d[0] ? "gray" : "transparent");
            }
        })
        .on("mouseleave", function(e, d) {
            if (selectedDate === "") {
                d3.selectAll(".dates")
                    .transition().duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "transparent");
            }
        })
        .on("click", function(d, e) {

        });

    svg.selectAll("rect")
        .transition()
        .duration(500)
        .attr("y", d => y(Math.max(0, d[1])))
        .attr("height", d => Math.abs(y(0) - y(d[1])))
        .delay((d, i) => i*15);
}