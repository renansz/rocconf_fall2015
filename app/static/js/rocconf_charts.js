
// Globals to store count information retrieved from the server
var sentiment_counts;
var sentiment_time_data;
var p_transition_matrix;
var p_percentages;

$(document).ready(function () {
    $('#myTabs a[href="#profile"]').tab('show'); // Select tab by name
    $('#myTabs a:first').tab('show'); // Select first tab
    $('#myTabs a:last').tab('show'); // Select last tab
    $('#myTabs li:eq(2) a').tab('show'); // Select third tab (0-indexed)

    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    // Call to get the sentiment data from the server
    $.ajax({
        url: '/sentiment',
        data: { 'session': 'multi_test_2' },
        type: 'GET',
        success: function (response)
        {
            sentiment_time_data = response.time;
            sentiment_counts = response.counts;

            set_sentiment_graph(sentiment_time_data['user_2']);
        },
        error: function (error) {
            console.log(error);
        }
    });

    //TODO - NEED THE ACTUAL DATA HERE TO LOAD
    var test_participation_data = [{
        "x": 1,
        "y1": 66,
        "y2": 34
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

    chart.write("chart-area");
}

//==============================================================
// Setup a microchart for a user in the specified div
//==============================================================
function set_participation_chart(data, location)
{
    chart = new AmCharts.AmSerialChart();
    chart.dataProvider = data;

    chart.categoryField = "x";
    chart.rotate = true;
    chart.autoMargins = false;
    chart.marginLeft = 0;
    chart.marginRight = 0;
    chart.marginTop = 0;
    chart.marginBottom = 0;

    // Graph of time spent speaking
    graph = new AmCharts.AmGraph();
    graph.valueField = "y1";
    graph.type = "column";
    graph.labelsEnabled = true;
    graph.labelText = data[0]["y1"] + "%";
    graph.labelPosition = "middle";
    graph.fillAlphas = 0.6;
    graph.fillColors = "#637bb6";
    graph.gradientOrientation = "horizontal";
    graph.lineColor = "#FFFFFF";
    graph.showBalloon = false;
    chart.addGraph(graph);

    // Graph of time not spent speaking
    var graph2 = new AmCharts.AmGraph();
    graph2.valueField = "y2";
    graph2.type = "column";
    graph2.fillAlphas = 0.2;
    graph2.fillColors = "#000000";
    graph2.lineColor = "#FFFFFF";
    graph2.showBalloon = false;
    chart.addGraph(graph2);

    valueAxis = new AmCharts.ValueAxis();
    valueAxis.gridAlpha = 0;
    valueAxis.axisAlpha = 0;
    valueAxis.stackType = "100%"; // this is set to achieve that column would occupie 100% of the chart area
    chart.addValueAxis(valueAxis);

    categoryAxis = chart.categoryAxis;
    categoryAxis.gridAlpha = 0;
    categoryAxis.axisAlpha = 0;

    chart.creditsPosition = "bottom-right";

    chart.write(location);
}
