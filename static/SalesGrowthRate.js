function salesGrowthRate(data) {
    d3.select("#growthrate").select("svg").remove();

    var margin = {top: 30, right: 20, bottom: 55, left: 55};
//        width = 650 - margin.left - margin.right,
//        height = 350 - margin.top - margin.bottom;
    var width = window.innerWidth * .4 - margin.left - margin.right;
    var height = window.innerHeight * .4 - margin.top - margin.bottom;

    var svg = d3.select("#growthrate")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
            .domain(data.map(d => d.YEAR_MONTH))
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
            .domain([d3.min(data.map(d => d.MONTHLYGROWTH)), d3.max(data.map(d => d.MONTHLYGROWTH))])
            .nice();

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font", "12px times");


    svg.selectAll()
        .data(data)
        .join("rect")
        .attr("class", d => "dates")
        .attr("x", d => x(d.YEAR_MONTH))
        .attr("y", d => y(0))
        .attr("width", x.bandwidth)
        .attr("height", d => Math.abs(height - y(d3.min(data.map(d => d.MONTHLYGROWTH)))))
        .attr("fill", "#947EC3")
        .on("mouseover", function(e, d) {
            d3.selectAll(".dates")
                .transition("mouseover3").duration(300)
                .style("opacity", a => a.YEAR_MONTH == d.YEAR_MONTH ? 1 : 0.3)
                .attr("stroke", a => a.YEAR_MONTH == d.YEAR_MONTH ? "gray" : "transparent");
        })
        .on("mouseleave", function(e, d) {
            d3.selectAll(".dates")
                .transition("mouseleave3").duration(300)
                .style("opacity", 1)
                .attr("stroke", "transparent");
        })
        .on("click", function(d, e) {

        });

    svg.selectAll("rect")
        .transition("start3")
        .duration(500)
        .attr("y", d => y(Math.max(0, d.MONTHLYGROWTH)))
        .attr("height", d => Math.abs(y(0) - y(d.MONTHLYGROWTH)))
        .delay((d, i) => i*15);

    svg.append("text")
       .attr("x", (width/2+20))
       .attr("y", -15)
       .attr("text-anchor", "middle")
       .style("font-size", "20px")
       .style("font-family", "serif")
       .style("font-weight", "bold ")
       .text("SALES GROWTH RATE")

   svg.append("text")
       .attr("transform", "translate(" + (width - 30) + ", " + (height + margin.bottom) + ")")
       .style("text-anchor", "middle")
       .style("font", "18px times")
       .text("Time(Month)")

   svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(height/2))
       .attr("y", -margin.left+20)
       .style("text-anchor", "middle")
       .style("font", "18px times")
       .text("Percentage Growth Rate")
}