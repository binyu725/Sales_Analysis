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
            } else if (url == '/growthRate') {
                growthRate(JSON.parse(d));
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
//    read_data('/stackedAreaChart');
    read_data('/pcp');
    read_data('/growthRate');
}

var svg_geomap, svg_barchart, svg_time, svg_pca;

dashboard();