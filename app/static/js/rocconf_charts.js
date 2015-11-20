$(document).ready(function () {
    $('#myTabs a[href="#profile"]').tab('show'); // Select tab by name
    $('#myTabs a:first').tab('show'); // Select first tab
    $('#myTabs a:last').tab('show'); // Select last tab
    $('#myTabs li:eq(2) a').tab('show'); // Select third tab (0-indexed)

    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    //TODO - NEED THE ACTUAL DATA HERE TO LOAD
    var test_participation_data = [{
        "x": 1,
        "value": 29
    }, {
        "x": 2,
        "value": 71
    }];

    set_participation_chart(test_participation_data, "panel_2");
    set_participation_chart(test_participation_data, "panel_3");
    //set_participation_chart(test_participation_data, "panel_4");
    //set_participation_chart(test_participation_data, "panel_5");

});

//==============================================================
// Setup the sentiment graph
//==============================================================
function set_sentiment_graph(data)
{
    var chart;
    var graph;

    chart = new AmCharts.AmSerialChart();
    chart.dataProvider = data;
    chart.marginLeft = 10;
    chart.categoryField = "time";

    // X Axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.minPeriod = "ss";
    categoryAxis.dashLength = 3;
    categoryAxis.minorGridEnabled = false;
    categoryAxis.minorGridAlpha = 0.1;
    categoryAxis.labelsEnabled = false;

    // Y Axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 0;
    valueAxis.inside = true;
    valueAxis.dashLength = 3;
    chart.addValueAxis(valueAxis);

    graph = new AmCharts.AmGraph();
    graph.type = "smoothedLine"; // this line makes the graph smoothed line.
    graph.lineColor = "#637bb6";
    graph.negativeLineColor = "#d1655d"; // this line makes the graph to change color when it drops below 0

    graph.lineThickness = 2;
    graph.valueField = "sentiment";
    chart.addGraph(graph);

    var chartCursor = new AmCharts.ChartCursor();
    chartCursor.cursorAlpha = 0;
    chartCursor.cursorPosition = "mouse";
    chartCursor.categoryBalloonDateFormat = "fff";
    chart.addChartCursor(chartCursor);

    chart.creditsPosition = "bottom-right";

    chart.write("sentiment_div");
}

//==============================================================
// Setup a microchart for a user in the specified div
//==============================================================
function set_participation_chart(data, location)
{
    chart = new AmCharts.AmPieChart();

    chart.dataProvider = data;
    chart.labelField = "x";
    chart.valueField = "value";
    chart.labelsEnabled = false;

    chart.balloonText = undefined;
    chart.valueText = undefined;

    chart.radius = 25; // half of a width of a div
    chart.colors = ["#DADADA", "#637bb6"];
    chart.startDuration = 0;

    chart.creditsPosition = "bottom";

    chart.write(location);
}
