
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
var smile_time_data;
var loudness_time_data;
var p_transition_matrix;
var avg_features;

function load_session_data(session)
{
    $.ajax({
        url: '/load_data',
        data: { 'session': session },
        type: 'GET',
        success: function (response) {
            sentiment_time_data = response.sentiment_time;
            sentiment_counts = response.sentiment_counts;
            avg_features = response.avg_features;
            smile_time_data = response.smile_time;
            loudness_time_data = response.loudness_time;

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

    var size = undefined;

    //Initialize the session - we assume 'user 1' is front and center
    set_smile_chart();

    for (var i = 1; i <= avg_features.length; i++) {
        i == 1? size = 140 : size = 80;
        set_participation_chart(avg_features['user_' + i], "subpanel_" + i + "_left",size);
        /* temp fix for demo */
        if (i!= 1)
          set_rate_chart(avg_features['user_' + i], "subpanel_" + i + "_right",size);
    }

    // Disabling unused users navigation buttons
    /*
    for (var j = avg_features.length + 1; j <= 5; j++)
    {
        document.getElementById("change-user-" + j + "-button").className += " disabled";
    }*/

    // Setting up the word cloud information
    word_cloud_data = [];

    for (element in sentiment_counts)
    {
        word_cloud_data[element] = [sentiment_counts[element]['text'],sentiment_counts[element]['counts']];
    }

    sorted_data = word_cloud_data.sort(function Comparator(a, b) {
                                        if (a[1] > b[1]) return -1;
                                        if (a[1] < b[1]) return 1;
                                        return 0;
                                    });

    final_cloud = [];

    for (element in sorted_data)
    {
        final_cloud[element] = [sorted_data[element][0], sorted_data[element][1]];
        if (element > 8)
            break;
    }

    setup_word_cloud(final_cloud);
}

//==============================================================
// Setup the Smile Frequency Graph
//==============================================================
function set_smile_chart()
{
    user = "user_" + $('.vjs-tech').attr('user');

    data = smile_time_data[user];

    document.getElementById("load_smile_graph").className = "active";
    document.getElementById("load_loudness_graph").className = "";
    document.getElementById("load_sentiment_graph").className = "";

    var chart;
    var graph;

    chart = new AmCharts.AmSerialChart();
    chart.dataProvider = data;
    chart.categoryField = "time";

    // X Axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.minPeriod = "ss";
    categoryAxis.dashLength = 3;
    categoryAxis.minorGridEnabled = false;
    categoryAxis.minorGridAlpha = 0.1;
    categoryAxis.labelsEnabled = true;

    // Y Axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 1;
    valueAxis.inside = true;
    valueAxis.dashLength = 3;
    valueAxis.maximum = 100;
    chart.addValueAxis(valueAxis);

    graph = new AmCharts.AmGraph();
    graph.type = "smoothedLine"; // this line makes the graph smoothed line.
    graph.lineColor = "#637bb6"; 

    graph.lineThickness = 2;
    graph.valueField = "intensity";
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
// Setup Loudness Intensity Graph
//==============================================================
function set_loudness_chart()
{
    user = "user_" + $('.vjs-tech').attr('user');

    data = loudness_time_data[user];

    document.getElementById("load_smile_graph").className = "";
    document.getElementById("load_loudness_graph").className = "active";
    document.getElementById("load_sentiment_graph").className = "";

    var chart;
    var graph;

    chart = new AmCharts.AmSerialChart();
    chart.dataProvider = data;
    chart.categoryField = "time";

    // X Axis
    var categoryAxis = chart.categoryAxis;
    categoryAxis.minPeriod = "ss";
    categoryAxis.dashLength = 3;
    categoryAxis.minorGridEnabled = false;
    categoryAxis.minorGridAlpha = 0.1;
    categoryAxis.labelsEnabled = true;

    // Y Axis
    var valueAxis = new AmCharts.ValueAxis();
    valueAxis.axisAlpha = 1;
    valueAxis.inside = true;
    valueAxis.dashLength = 3;
    valueAxis.maximum = 100;
    chart.addValueAxis(valueAxis);

    graph = new AmCharts.AmGraph();
    graph.type = "smoothedLine"; // this line makes the graph smoothed line.
    graph.lineColor = "#637bb6";

    graph.lineThickness = 2;
    graph.valueField = "intensity";
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
// Setup the sentiment graph
//==============================================================
function set_sentiment_chart()
{
    user = "user_" + $('.vjs-tech').attr('user');

    data = sentiment_time_data[user];

    document.getElementById("load_smile_graph").className = "";
    document.getElementById("load_loudness_graph").className = "";
    document.getElementById("load_sentiment_graph").className = "active";

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
// Time on the Floor Microchart - For user at Location
//==============================================================
function set_participation_chart(data, el, size)
{
    var pie = new d3pie(el, {
        "size": {
            "canvasHeight": size,
            "canvasWidth": size,
            "pieOuterRadius": "88%"
        },
        "data": {
            "content": [{
                "value": data[0]['speak']/100,
                "color": "#607d8b"
            },
            {
                "value": data[0]['rem']/100,
                "color": "#cccccc"
            }]
        },
        "labels": {
            "outer": {
                "pieDistance": 1
            },
            "inner": {
                "format": "value"
            },
            "percentage": {
                "color": "#e1e1e1",
                "font": "verdana",
                "decimalPlaces": 1
            },
            "value": {
                "color": "#e1e1e1",
                "font": "verdana"
            },
            "truncation": {
                "enabled": true
            }
        },
        "effects": {
            "pullOutSegmentOnClick": {
                "effect": "linear",
                "speed": 400,
                "size": 4
            }
        }
    });
}

//==============================================================
// Speaking Rate Microchart - For user at Location
//==============================================================

function set_rate_chart(data, el, size)
{
    var needle;

    var barWidth, chart, chartInset, degToRad, repaintGauge,
    height, margin, numSections, padRad, percToDeg, percToRad,
    percent, radius, sectionIndx, svg, totalPercent, width;

    //percent = position;
    percent = data[0]['rate'] / 150;

    numSections = 1;
    sectionPerc = 1 / numSections / 2;
    padRad = 0.025;
    chartInset = 10;

    // Orientation of gauge:
    totalPercent = 0.75;

    el = d3.select('#' + el);

    margin = {
        top: 0,
        right: 2,
        bottom: 0,
        left: 2
    };

    //width = el[0][0].offsetWidth - margin.left - margin.right;
    width = size;
    height = width;
    //DEBUG alert('height: '+height+'width: '+width);
    radius = Math.min(width, height) / 2;
    barWidth = 40 * width / 300;

    /*
      Utility methods 
    */
    percToDeg = function (perc) {
        return perc * 360;
    };

    percToRad = function (perc) {
        return degToRad(percToDeg(perc));
    };

    degToRad = function (deg) {
        return deg * Math.PI / 180;
    };

    // Create SVG element
    svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

    // Add layer for the panel
    chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2) + ")");
    chart.append('path').attr('class', "arc chart-filled");
    chart.append('path').attr('class', "arc chart-empty");

    arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
    arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

    repaintGauge = function (perc) {
        var next_start = totalPercent;
        arcStartRad = percToRad(next_start);
        arcEndRad = arcStartRad + percToRad(perc / 2);
        next_start += perc / 2;


        arc1.startAngle(arcStartRad).endAngle(arcEndRad);

        arcStartRad = percToRad(next_start);
        arcEndRad = arcStartRad + percToRad((1 - perc) / 2);

        arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);


        chart.select(".chart-filled").attr('d', arc1);
        chart.select(".chart-empty").attr('d', arc2);

    }


    var Needle = (function () {

        /** 
          * Helper function that returns the `d` value
          * for moving the needle
        **/
        var recalcPointerPos = function (perc) {
            var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
            thetaRad = percToRad(perc / 2);
            centerX = 0;
            centerY = 0;
            topX = centerX - this.len * Math.cos(thetaRad);
            topY = centerY - this.len * Math.sin(thetaRad);
            leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
            leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
            rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
            rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
            return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
        };

        function Needle(el) {
            this.el = el;
            this.len = width / 3;
            this.radius = this.len / 6;
        }

        Needle.prototype.render = function () {
            this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
            return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
        };

        Needle.prototype.moveTo = function (perc) {
            var self,
                oldValue = this.perc || 0;

            this.perc = perc;
            self = this;

            // Reset pointer position
            this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function () {
                return function (percentOfPercent) {
                    var progress = (1 - percentOfPercent) * oldValue;

                    repaintGauge(progress);
                    return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                };
            });

            this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function () {
                return function (percentOfPercent) {
                    var progress = percentOfPercent * perc;

                    repaintGauge(progress);
                    return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                };
            });

        };

        return Needle;

    })();

    needle = new Needle(chart);
    needle.render();

    needle.moveTo(percent);
}



/******************************************************************************
 * Directed graph
 *****************************************************************************/
//http://bl.ocks.org/rkirsling/5001347
