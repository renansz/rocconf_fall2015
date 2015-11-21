
$(document).ready(function () {
    $('#myTabs a[href="#profile"]').tab('show'); // Select tab by name
    $('#myTabs a:first').tab('show'); // Select first tab
    $('#myTabs a:last').tab('show'); // Select last tab
    $('#myTabs li:eq(2) a').tab('show'); // Select third tab (0-indexed)

    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    load_session_data("multi_test_2")

});

//==============================================================
// AJAX call to load in our chart data for a session
//==============================================================

// Variables for storing information about a session
var sentiment_counts;
var sentiment_time_data;
var p_transition_matrix;
var p_percentages;

function load_session_data(session)
{
    $.ajax({
        url: '/load_data',
        data: { 'session': session },
        type: 'GET',
        success: function (response) {
            sentiment_time_data = response.sentiment_time;
            sentiment_counts = response.sentiment_counts;
            p_percentages = response.p_percentages;

            init_session();
        },
        error: function (error) {
            console.log(error);
        }
    });
}

//==============================================================
// Initialize a Session after Loading
//==============================================================
function init_session()
{
    //Initialize the session - we assume 'user 1' is front and center
    set_sentiment_graph(sentiment_time_data['user_1']);

    for (var i = 2; i <= p_percentages.length; i++) {
        set_participation_chart(p_percentages['user_' + i], "panel_" + i);
    }
}

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
    graph.valueField = "speak";
    graph.type = "column";
    graph.labelsEnabled = true;
    graph.labelText = data[0]["speak"] + "%";
    graph.labelPosition = "bottom";
    graph.fillAlphas = 0.6;
    graph.fillColors = "#637bb6";
    graph.gradientOrientation = "horizontal";
    graph.lineColor = "#FFFFFF";
    graph.showBalloon = false;
    chart.addGraph(graph);

    // Graph of time not spent speaking
    var graph2 = new AmCharts.AmGraph();
    graph2.valueField = "rem";
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
