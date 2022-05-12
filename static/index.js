function read_data(url) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function (d) {
            if (url == '/barchart') {
                barchart(JSON.parse(d));
            } else if (url == '/stackedBarchart') {
                stackedBarchart(JSON.parse(d));
            } else if (url == '/stackedAreaChart') {
                stackedAreaChart(JSON.parse(d));
            } else if (url == '/pcp') {
                pcp(JSON.parse(d));
            } else if (url == '/geomap') {
                geomap(JSON.parse(d));
            } else if (url == '/growthRate') {
                growthRate(JSON.parse(d));
            } else if (url == '/salesGrowthRate') {
                salesGrowthRate(JSON.parse(d));
            }
        },
        error: function (d) {
            console.log(d);
        }
    });
}

function postData(url) {
    var dataObj = {}
    if (selectedCountry !== "") {
        dataObj.country_name = selectedCountry;
    }
    if (selectedQuarter !== "") {
        dataObj.time_period = selectedQuarter;
    }
    if (selectedProduct !== "") {
        dataObj.product = selectedProduct;
    }
    if (selectedCustomer !== "") {
        dataObj.customer_name = selectedCustomer;
    }
    $.ajax({
        url: url,
        type: Object.keys(dataObj).length === 0 ? "GET" : 'POST',
        data: dataObj,
        success: function (d) {
            if (url == '/barchart') {
                barchart(JSON.parse(d));
            } else if (url == '/stackedBarchart') {
                stackedBarchart(JSON.parse(d));
            } else if (url == '/stackedAreaChart') {
                stackedAreaChart(JSON.parse(d));
            } else if (url == '/pcp') {
                pcp(JSON.parse(d));
            } else if (url == '/geomap') {
                geomap(JSON.parse(d));
            } else if (url == '/growthRate') {
                growthRate(JSON.parse(d));
            } else if (url == '/salesGrowthRate') {
                salesGrowthRate(JSON.parse(d));
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function dashboard() {
    read_data('/geomap')
    read_data('/barchart');
    select_bar_display()
    read_data('/pcp');
    select_growth_display()
}

function select_bar_display() {
    var checked = document.getElementById("Bar").checked;
    if (checked) {
        postData('/stackedBarchart');
    } else {
        postData('/stackedAreaChart');
    }
}

function select_growth_display() {
    var checked = document.getElementById("customer").checked;
    if (checked) {
        postData('/growthRate');
    } else {
        postData('/salesGrowthRate');
    }
}

function checkAllEmpty() {
    return selectedCountry === "" && selectedQuarter === "" && selectedProduct === "" && selectedCustomer === "";
}

var selectedCountry = "";
var selectedQuarter = "";
var selectedProduct = "";
var selectedCustomer = "";

dashboard();