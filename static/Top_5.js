function barchart(transferred_data, variable="CUSTOMERNAME") {
//    var variable_count = d3.rollups(data.data, v => d3.sum(v, d => d.SALES), d => d[variable])
//                    .sort(([, a], [, b]) => d3.descending(a, b))

    d3.select("#top-5").select("svg").remove();

    var data = transferred_data.data;

    var margin = {top: 50, right: 20, bottom: 50, left: 150};
//        width = 650 - margin.left - margin.right,
//        height = 350 - margin.top - margin.bottom;
    var width = window.innerWidth * .2 - margin.left - margin.right;
    var height = window.innerHeight * .45 - margin.top - margin.bottom;


    var svg_barchart = d3.select("#top-5")
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
        .selectAll("text")
        .attr("transform", "translate(-10,10)rotate(-45)")
        .style("font", "12px times");

    var y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.CUSTOMERNAME))
            .padding(0.1);


    svg_barchart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font", "10px times");

    var selectedCustomer = "";

    svg_barchart.selectAll()
        .data(data)
        .join("rect")
        .attr("class", d => "customers")
        .attr("x", 1)
        .attr("y", d => y(d.CUSTOMERNAME))
        .attr("width", d => x(0))//d => x(d.SALES))
        .attr("height", y.bandwidth)
        .attr("fill", "#947EC3")
        .on("mouseover", function(e, d) {
            if (selectedCustomer === "") {
                d3.selectAll(".customers")
                    .transition("mouseover2").duration(300)
                    .style("opacity", a => a.CUSTOMERNAME == d.CUSTOMERNAME ? 1 : 0.3)
                    .attr("stroke", a => a.CUSTOMERNAME == d.CUSTOMERNAME ? "gray" : "transparent");
            }
        })
        .on("mouseleave", function(e, d) {
            if (selectedCustomer === "") {
                d3.selectAll(".customers")
                    .transition("mouseleave2").duration(300)
                    .style("opacity", 1)
                    .attr("stroke", "transparent");
            }
        })
        .on("click", function(e, d) {
            if (selectedCustomer === d.CUSTOMERNAME) {
                selectedCustomer = "";
            } else {
                selectedCustomer = d.CUSTOMERNAME;
                d3.selectAll(".customers")
                    .transition("click2").duration(300)
                    .style("opacity", a => a.CUSTOMERNAME == d.CUSTOMERNAME ? 1 : 0.3)
                    .attr("stroke", a => a.CUSTOMERNAME == d.CUSTOMERNAME ? "gray" : "transparent");
            }

            $.ajax({
                url: "/stackedBarchart",
                type: selectedCustomer === "" ? "GET" : 'POST',
                data: {
                    customer_name: d.CUSTOMERNAME
                },
                success: function (f) {
                    stackedBarchart(JSON.parse(f));
                },
                error: function (f) {
                    console.log(f);
                }
            });
            $.ajax({
                url: "/geomap",
                type: selectedCustomer === "" ? "GET" : 'POST',
                data: {
                    customer_name: d.CUSTOMERNAME
                },
                success: function (f) {
                    geomap(JSON.parse(f));
                },
                error: function (f) {
                    console.log(f);
                }
            });
        });

    svg_barchart.selectAll("rect")
        .transition("start2")
        .duration(800)
        .attr("width", d => x(d.SALES))
        .delay((d, i) => i*15);

   svg_barchart.append("text")
       .attr("x", (width/2-40))
       .attr("y", -15)
       .attr("text-anchor", "middle")
       .style("font-size", "20px")
       .style("font-family", "serif")
       .style("font-weight", "bold ")
       .text("TOP 10 CUSTOMER")

   svg_barchart.append("text")
       .attr("transform", "translate(" + (width) + ", " + (height + margin.bottom) + ")")
       .style("text-anchor", "middle")
       .style("font", "18px times")
       .text("Sales")

   svg_barchart.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(height/2))
       .attr("y", -margin.left+20)
       .style("text-anchor", "middle")
       .style("font", "18px times")
       .text("Customer name")
}