
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
var session_counts;
var sentiment_time_data;
var smile_time_data;
var loudness_time_data;
var p_transition_matrix;
var avg_features;
var participation_metrics;
var sentiment_counts;
var smile_counts;

function load_session_data(session)
{
    $.ajax({
        url: '/load_data',
        data: { 'session': session },
        type: 'GET',
        success: function (response) {
            sentiment_time_data = response.sentiment_time;
            session_counts = response.session_counts;
            avg_features = response.avg_features;
            smile_time_data = response.smile_time;
            loudness_time_data = response.loudness_time;
            p_transition_matrix = response.p_matrix;
            participation_metrics = response.p_metrics;
            sentiment_counts = response.sentiment_counts;
            smile_counts = response.smile_counts;

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

    set_smile_chart();

    for (var i = 1; i <= avg_features.length; i++)
    {
        user_loc = $('#video-player-' + i).attr('user');

        p_data = participation_metrics['spk_avg'];

        if (user_loc == 1)
        {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 140)
            set_rate_chart(avg_features['user_' + i], "subpanel_" + user_loc + "_right", 80);
        }
        else
        {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 80)
            set_rate_chart(avg_features['user_' + i], "subpanel_" + user_loc + "_right", 80);
        }
    }

    // Setting up the word cloud information
    word_cloud_data = [];

    for (element in session_counts)
    {
        word_cloud_data[element] = [session_counts[element]['text'], session_counts[element]['counts']];
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

    draw_directed_graph(p_transition_matrix,participation_metrics);
}

//==============================================================
// Initialize a Session after Loading
//==============================================================
function update_session() {

    var size = undefined;

    set_smile_chart();

    for (var i = 1; i <= avg_features.length; i++) {
        user_loc = $('#video-player-' + i).attr('user');

        p_data = participation_metrics['spk_avg'];

        if (user_loc == 1) {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 140)
            set_rate_chart(avg_features['user_' + i], "subpanel_" + user_loc + "_right", 80);
        }
        else {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 80)
            set_rate_chart(avg_features['user_' + i], "subpanel_" + user_loc + "_right", 80);
        }
    }
}

//==============================================================
// Setup the Smile Frequency Graph
//==============================================================
function set_smile_chart()
{

    //Which user is in slot #1?
    user_num = 0;

    for (var i = 1; i <= avg_features.length; i++)
    {
        user_loc = $('#video-player-' + i).attr('user');
        if(user_loc == 1)
        {
            user_num = i;
            break;
        }
    }
    
    user = "user_" + user_num;

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
    //Which user is in slot #1?
    user_num = 0;

    for (var i = 1; i <= avg_features.length; i++) {
        user_loc = $('#video-player-' + i).attr('user');
        if (user_loc == 1) {
            user_num = i;
            break;
        }
    }

    user = "user_" + user_num;

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
    //Which user is in slot #1?
    user_num = 0;

    for (var i = 1; i <= avg_features.length; i++) {
        user_loc = $('#video-player-' + i).attr('user');
        if (user_loc == 1) {
            user_num = i;
            break;
        }
    }

    user = "user_" + user_num;
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
    //first clear the element
    if (el == 'subpanel_1_left')
        $('#' + el).html('<h5><strong>Participation Rate</strong></h5>');
    else
        $('#' + el).empty();

    var pie = new d3pie(el, {
        "size": {
            "canvasHeight": size,
            "canvasWidth": size,
            "pieOuterRadius": "88%"
        },
        "data": {
            "content": [{
                "label":'',
                "value": Math.round(data['p_spk'] * 100) / 100,
                "color": "#607d8b"
            },
            {
                "label": '',
                "value": Math.round(data['p_nospeak'] * 100) / 100,
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
    if (el == 'subpanel_1_right')
        $('#' + el).html('<h5><strong>Speaking Rate</strong></h5>');
    else
        $('#' + el).empty();

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

function draw_directed_graph(matrix,participation){
  var i,
      j,
      s,
      N = matrix.length,
      dg = {
          nodes: [],
          edges: []
      };

  // generate locations (so that it is not random and mesed up
  var dg_positions;
  if (N <= 5){
    dg_positions = [[0.5,1],[0.75,0],[1,0.5],[0,0.5],[0.25,0]]
    dg_positions = [[0,0.5],[0.5,0],[0.75,1],[0,0.5],[0.25,0]]
    dg_positions = [[0,0.45],[0.25,0],[0.35,1],[0,0.25],[0.15,0]]
  }else{
    for (i=0;i<N;i++)
      dg_positions[i] = [Math.random(),Math.random()]
  }

  // generate the graph with matrix data


  // make nodes
  for(i=0;i<N;i++){
    dg.nodes.push({
      id: 'n'+i,
      label: 'User '+i+' ['+Math.round(participation.spk_avg['user_'+(i+1)].p_spk)+'%]',
      x: dg_positions[i][0],
      y: dg_positions[i][1],
      size: participation.spk_avg['user_'+(i+1)].p_spk,
      color: '#009688'
    });
  }



  // make edges 
  for (i=0;i<N;i++){
    for(j=0;j<N;j++){
      dg.edges.push({
        id: 'e'+i+','+j,
        type: "arrow",
        source: 'n'+i,
        target: 'n'+j,
        size: matrix[i][j]*10,
        color: '#000'
      });
    }
  }


  //create directed graph object
  s = new sigma({
                  graph: dg,
                  container: 'directed_graph',
                  settings:{
                    labelThreshold: 0,
                    sideMargin: 0.3,

                    // edges settings
                    minNodeSize: 1,
                    maxNodeSize: 10,
                    minEdgeSize: 1,
                    maxEdgeSize: 6
                  }
                });
  s.refresh();
}
