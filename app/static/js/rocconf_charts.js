
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


/**********************************************************
 * D3 js pie chart -- facke data
 **********************************************************/
function pie_chart(el,participation){
  var pie = new d3pie(el, {
    "size": {
      "canvasHeight": 60,
      "canvasWidth": 60,
      "pieOuterRadius": "88%"
    },
    "data": {
      "content": [{
        "value": participation/100,
        "color": "#607d8b"
      },
      {
        "value": 1-participation/100,
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

pie_chart('subpanel_2_left',40);
pie_chart('subpanel_3_left',50);
pie_chart('subpanel_4_left',60);
pie_chart('subpanel_5_left',70);

/**********************************************************
 * D3 js pie chart
 **********************************************************/
var needle;

function gauge_chart(id,percent){

var barWidth, chart, chartInset, degToRad, repaintGauge,
    height, margin, numSections, padRad, percToDeg, percToRad, 
    percent, radius, sectionIndx, svg, totalPercent, width;

  //percent = position;
  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0.025;
  chartInset = 10;

  // Orientation of gauge:
  totalPercent = 0.75;

  el = d3.select('#'+id);

  margin = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };

  width = el[0][0].offsetWidth - margin.left - margin.right;
  height = width/1.2;
  //DEBUG alert('height: '+height+'width: '+width);
  radius = Math.min(width, height) / 2;
  barWidth = 40 * width / 300;


  /*
    Utility methods 
  */
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
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

  repaintGauge = function (perc) 
  {
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


  var Needle = (function() {

    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    var recalcPointerPos = function(perc) {
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

    Needle.prototype.render = function() {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
      return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
    };

    Needle.prototype.moveTo = function(perc) {
      var self,
          oldValue = this.perc || 0;

      this.perc = perc;
      self = this;

      // Reset pointer position
      this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function() {
        return function(percentOfPercent) {
          var progress = (1 - percentOfPercent) * oldValue;
          
          repaintGauge(progress);
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });

      this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function() {
        return function(percentOfPercent) {
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

};

gauge_chart('subpanel_2_right',0.30);
gauge_chart('subpanel_3_right',0.40);
gauge_chart('subpanel_4_right',0.50);
gauge_chart('subpanel_5_right',0.60);




/******************************************************************************
 * Directed graph
 *****************************************************************************/
//http://bl.ocks.org/rkirsling/5001347
