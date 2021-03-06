var user_colors = ['#009688','#FFC107','#FF5722','#673AB7','#E91E63']

$(document).ready(function () {
    $('#myTabs a[href="#profile"]').tab('show'); // Select tab by name
    $('#myTabs a:first').tab('show'); // Select first tab
    $('#myTabs a:last').tab('show'); // Select last tab
    $('#myTabs li:eq(2) a').tab('show'); // Select third tab (0-indexed)

    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });

    var session_id = $(window).attr('location').pathname.split('/').reverse()[0]
    if (typeof(session_id) != "undefined"){
        load_session_data(session_id)
    }else{
        load_session_data("multi_test_2")
    }
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
var average_intensity;
var num_users;

/* variables for charts */
var dg;

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
            average_intensity = response.avg_smile;
            num_users = response.length;

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

    for (var i = 1; i <= num_users; i++)
    {
        user_loc = $('#video-player-' + i).attr('user');

        p_data = participation_metrics['spk_avg'];

        if (user_loc == 1)
        {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 140,i)
            set_rate_chart(p_data['user_' + i], "subpanel_" + user_loc + "_right", 140,i);
            $('.chart-filled').css('fill',user_colors[0])
        }
        else
        {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 80,i)
            set_rate_chart(p_data['user_' + i], "subpanel_" + user_loc + "_right", 140,i);
        }
    }

    // directed graph
    dg = draw_directed_graph2(p_transition_matrix,participation_metrics);
	
    // participation graphs
	var user_part_count = participation_metrics['spk_counts'];
	set_user_participation_chart(user_part_count);

	var user_avg_spk_time = participation_metrics['spk_avg'];
    set_user_avg_spk(user_avg_spk_time);

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

	console.log(sentiment_counts);
}

//==============================================================
// Updating Charts after Video Swap
//==============================================================
function update_session() {

    var size = undefined;

    set_smile_chart();

    for (var i = 1; i <= num_users; i++) {
        user_loc = $('#video-player-' + i).attr('user');

        p_data = participation_metrics['spk_avg'];

        if (user_loc == 1) {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 140,i)
            set_rate_chart(p_data['user_' + i], "subpanel_" + user_loc + "_right", 140,i);
            $('.chart-filled').css('fill',user_colors[i-1])
        }
        else {
            set_participation_chart(p_data['user_' + i], "subpanel_" + user_loc + "_left", 80,i)
            set_rate_chart(p_data['user_' + i], "subpanel_" + user_loc + "_right", 140,i);
        }

        // set panel header color
        console.log('user loc: '+user_loc+' , user: '+i);
        if (user_loc==1){
            $('#main-video-container').css('background-image',"url('static/img/color"+i+".png')");
        }else{
            $('#video-'+user_loc).css('background-image',"url('static/img/color"+i+".png')");
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

    for (var i = 1; i <= num_users; i++)
    {
        user_loc = $('#video-player-' + i).attr('user');
        if(user_loc == 1)
        {
            user_num = i;
            break;
        }
    }
    
    user = "user_" + user_num;

    // Setup the navigation display
    document.getElementById("load_smile_graph").className = "active";
    document.getElementById("load_loudness_graph").className = "";
    document.getElementById("load_sentiment_graph").className = "";
    document.getElementById("word_list").className = "";

    // Merge the data into an amCharts data set.
    smile_data = smile_time_data[user];
    group_data = average_intensity;

    
    data_to_graph = [];

    for (var i = 0; i < smile_data.length; i++)
    {
        data_to_graph.push({ time: smile_data[i].time, intensity: smile_data[i].intensity, avg_intensity: group_data[i].intensity });
    }

    data_set = new AmCharts.DataSet();
    data_set.fieldMappings = [{
        fromField: "intensity",
        toField: "smile",
    }, {
        fromField: "avg_intensity",
        toField: "avg_smile"
    }];
    data_set.dataProvider = data_to_graph;
    data_set.categoryField = "time";

    var chart = new AmCharts.AmStockChart();
    chart.pathToImages = "static/amcharts/images/";
    chart.dataSets = [data_set];

    var stock_panel = new AmCharts.StockPanel();
    stock_panel.fontFamily = "Lato";
    stock_panel.id = "serialVisualFeaturesChartPanel";
    stock_panel.sequencedAnimation = false;
    stock_panel.startDuration = 0.5;
    stock_panel.numberFormatter = {
        "precision": 1,
        "decimalSeparator": '.',
        "thousandsSeparator": ','
    };

    var value_axis = new AmCharts.ValueAxis();
    value_axis.maximum = 100; 
    stock_panel.addValueAxis(value_axis);

    // Graph of the users smile
    var graph1 = new AmCharts.StockGraph();
    graph1.title = "Smile Intensity";
    graph1.type = "smoothedLine";
    graph1.valueAxis = value_axis;
    graph1.valueField = "smile";
    graph1.balloonText = "";
    graph1.fillAlphas = 0.1;
    graph1.lineColor = user_colors[user_num - 1];
    graph1.lineThickness = 2;
    graph1.periodValue = "Average";
    graph1.useDataSetColors = false;
    stock_panel.addStockGraph(graph1);

    // Graph of the average smile intensity
    var graph2 = new AmCharts.StockGraph();
    graph2.id = "graph2";
    graph2.title = "Average Intensity";
    graph2.type = "smoothedLine";
    graph2.valueAxis = value_axis;
    graph2.valueField = "avg_smile";
    graph2.balloonText = "";
    graph2.fillAlphas = 0.1;
    graph2.lineColor = "#637bb6";
    graph2.lineThickness = 2;
    graph2.periodValue = "Average";
    graph2.useDataSetColors = false;
    stock_panel.addStockGraph(graph2);

    var stockLegend1 = new AmCharts.StockLegend();
    stock_panel.stockLegend = stockLegend1;

    // Adjust category axis
    var categoryAxis = stock_panel.categoryAxis;
    categoryAxis.boldPeriodBeginning = false;
    categoryAxis.parseDates = true;

    var chartCursor = new AmCharts.ChartCursor();
    chartCursor.animationDuration = 0;
    stock_panel.chartCursor = chartCursor;

    // set panels to the chart
    chart.panels = [stock_panel];

    /*
    var sbsettings = new AmCharts.ChartScrollbarSettings();
    sbsettings.enabled = false;
    smile_chart.chartScrollbarSettings = sbsettings;
    */
    
    var cursorSettings = new AmCharts.ChartCursorSettings();
    //cursorSettings.categoryBalloonEnabled = false;
    cursorSettings.graphBulletSize = 1.2;
    cursorSettings.valueBalloonsEnabled = true;
    cursorSettings.categoryBalloonAlpha = 0;
    cursorSettings.categoryBalloonColor = "transparent";
    cursorSettings.categoryBalloonDateFormats = [{
        period: 'fff',
        format: 'NN:SS.QQQ'
    }, {
        period: 'ss',
        format: 'NN:SS'
    }, {
        period: 'mm',
        format: 'NN:SS'
    }, {
        period: 'hh',
        format: 'NN:SS'
    }, {
        period: 'DD',
        format: 'NN:SS'
    }, {
        period: 'WW',
        format: 'NN:SS'
    }, {
        period: 'MM',
        format: 'NN:SS'
    }, {
        period: 'YYYY',
        format: 'NN:SS'
    }];
    chart.chartCursorSettings = cursorSettings;

    var legendSettings = new AmCharts.LegendSettings();
    legendSettings.color = "#878586";
    legendSettings.divId = "serialVisualFeaturesLegenddiv";
    legendSettings.fontSize = 16;
    legendSettings.marginLeft = 14;
    legendSettings.marginTop = 10;
    legendSettings.rollOverGraphAlpha = 0.2;
    legendSettings.switchType = "v";
    chart.legendSettings = legendSettings;

    var valueAxesSettings = new AmCharts.ValueAxesSettings();
    valueAxesSettings.color = "#9c9c9c";
    chart.valueAxesSettings = valueAxesSettings;

    var categoryAxesSettings = new AmCharts.CategoryAxesSettings();
    categoryAxesSettings.color = "#878586";
    categoryAxesSettings.gridAlpha = 0;
    //categoryAxesSettings.minPeriod = "ss";
    categoryAxesSettings.minPeriod = "10fff";
    //categoryAxesSettings.groupToPeriods = ["fff", "10fff","100fff","500fff","ss", "10ss", "30ss"];
    categoryAxesSettings.groupToPeriods = ["10fff", "100fff", "500fff", "ss", "10ss"];
    categoryAxesSettings.dateFormats = [{
        period: 'fff',
        format: 'NN:SS.QQQ'
    }, {
        period: 'ss',
        format: 'NN:SS'
    }, {
        period: 'mm',
        format: 'NN:SS'
    }, {
        period: 'hh',
        format: 'NN:SS'
    }, {
        period: 'DD',
        format: 'NN:SS'
    }, {
        period: 'WW',
        format: 'NN:SS'
    }, {
        period: 'MM',
        format: 'NN:SS'
    }, {
        period: 'YYYY',
        format: 'NN:SS'
    }];
    
    chart.categoryAxesSettings = categoryAxesSettings;

    chart.write('chart-area');
}

//==============================================================
// Setup Loudness Intensity Graph
//==============================================================
function set_loudness_chart()
{
    //Which user is in slot #1?
    user_num = 0;

    for (var i = 1; i <= num_users; i++) {
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
	document.getElementById("word_list").className = "";

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
    graph.lineColor = user_colors[user_num - 1];

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
// Setup the user participation graph at left panel
//==============================================================
function set_user_participation_chart(data)
{
	var graph=[];
	for (var key in data) {
		var temp = key.replace(/_/gi,"");
		var temp2=temp.replace(/u/gi,"U");
		var item={"user": temp2,"count":data[key],"color":user_colors[Number(temp2.substring(4,5))-1]};
		graph.push(item);
	}
	/*console.log(graph);
	
	xp= [{
    "country": "USA",
    "visits": 3
  }, {
    "country": "China",
    "visits": 6
  },  ];
  console.log(xp);*/
	var chart = AmCharts.makeChart( "chartdiv", {
  "type": "serial",
  "theme": "light",
  "dataProvider": graph,
  "valueAxes": [ {
    "gridColor": "#FFFFFF",
    "gridAlpha": 0.2,
    "dashLength": 0
  } ],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [ {
    "balloonText": "[[category]]: <b>[[value]]</b>",
    "fillAlphas": 0.8,
    "lineAlpha": 0.2,
    "type": "column",
    "valueField": "count",
    "fillColorsField": "color"
  } ],
  "chartCursor": {
    "categoryBalloonEnabled": false,
    "cursorAlpha": 0,
    "zoomable": false
  },
  "categoryField": "user",
  "categoryAxis": {
    "gridPosition": "start",
    "gridAlpha": 0,
    "labelsEnabled": false
/*    "tickPosition": "start",
    "tickLength": 20*/
  },
  "export": {
    "enabled": true
  }

} );

}

//==============================================================
// Setup the user avg speak time graph at left panel
//==============================================================
function set_user_avg_spk(data)
{
	var graph=[];
	for (var key in data) {
		var item;
		var temp = key.replace(/_/gi,"");
		var temp2=temp.replace(/u/gi,"U");
		//console.log(data[key]['avg_speak']);
		/* for (var innerkey in data[key]){
			item={"user": temp2,"count": data[key][innerkey]}
		} */
		item={"user": temp2,"count":data[key]['avg_speak'],"color":user_colors[Number(temp2.substring(4,5))-1]};
		graph.push(item);
	}
	/*console.log(graph);
	
	xp= [{
    "country": "USA",
    "visits": 3
  }, {
    "country": "China",
    "visits": 6
  },  ];
  console.log(xp);*/
	var chart = AmCharts.makeChart( "avgspeaktime", {
  "type": "serial",
  "theme": "light",
  "dataProvider": graph,
  "valueAxes": [ {
    "gridColor": "#FFFFFF",
    "gridAlpha": 0.2,
    "dashLength": 0
  } ],
  "gridAboveGraphs": true,
  "startDuration": 1,
  "graphs": [ {
    "balloonText": "[[category]]: <b>[[value]]</b>",
    "fillAlphas": 0.8,
    "lineAlpha": 0.2,
    "type": "column",
    "valueField": "count",
    "fillColorsField": "color"
  } ],
  "chartCursor": {
    "categoryBalloonEnabled": false,
    "cursorAlpha": 0,
    "zoomable": false
  },
  "categoryField": "user",
  "categoryAxis": {
    "gridPosition": "start",
    "gridAlpha": 0,
    /*"tickPosition": "start",
    "tickLength": 20*/
    "labelsEnabled": false
  },
  "export": {
    "enabled": true
  }

} );

}

//==============================================================
// Setup the sentiment word list
//==============================================================

function set_sentiment_word()
{
	user_num = 0;

    for (var i = 1; i <= num_users; i++) {
        user_loc = $('#video-player-' + i).attr('user');
        if (user_loc == 1) {
            user_num = i;
            break;
        }
    }
	user = "user_" + user_num;
    data = sentiment_counts[user];
	
	document.getElementById("load_smile_graph").className = "";
    document.getElementById("load_loudness_graph").className = "";
	document.getElementById("load_sentiment_graph").className = "";
    document.getElementById("word_list").className = "active";
	
	
	
	$('#chart-area').html("<div id=\"list1\" class='alert alert-info' role='alert'  style='float: left; width: 48%;'><h5><b>Negative Words</b></h5></div><div class='alert alert-info' id='list2' role='alert' style='float: right; width: 48%;'><h5><b>Positive Words</b></h5></div>");
	
	//console.log(data);
	for (var i in data['neg']){		
		var temp = data['neg'][i];
		var word = data['neg'][i]['text'];
		//console.log(word);
		$('#list1').append(word+"<br/>");		
	}
	
	for (var i in data['pos']){		
		var temp = data['pos'][i];
		var word = data['pos'][i]['text'];
		//console.log(word);
		$('#list2').append(word+"<br/>");		
	}
	
	
	
	//$('chart-area').remove();
}

//==============================================================
// Setup the sentiment graph
//==============================================================
function set_sentiment_chart()
{
    //Which user is in slot #1?
    user_num = 0;

    for (var i = 1; i <= num_users; i++) {
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
	document.getElementById("word_list").className = "";

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
function set_participation_chart(data, el, size, user_id)
{

    console.log(JSON.stringify(data)+'|'+el+'|'+size+'|'+user_id+'|'+user_colors[user_id-1]);
    //first clear the element
    if (el == 'subpanel_1_left')
        $('#' + el).html('<h5><strong>Participation Rate</strong></h5>');
    else
        $('#' + el).empty();


    var p_spk = Math.round(data['p_spk'] * 100) / 100;
    var p_nospeak = Math.round(data['p_nospeak'] * 100) / 100;

    if (p_spk == 0) p_spk = 0.0001;
    if (p_nospeak == 0) p_nospeak = 0.0001;

    var pie = new d3pie(el, {
        "size": {
            "canvasHeight": size,
            "canvasWidth": size,
            "pieOuterRadius": "88%"
        },
        "data": {
            "content": [{
                "label":'',
                "value": p_spk,
                "color": user_colors[user_id - 1]
            },
            {
                "label": '',
                "value": p_nospeak,
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
                "color": "#000",
                "font": "verdana",
                "decimalPlaces": 1
            },
            "value": {
                "color": "#000",
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
// based on this example -- http://bl.ocks.org/ameyms/9184728
//==============================================================

function set_rate_chart(data, el, size, user_id)
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
    percent = data['spk_rate'] / 220;

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
Based on this example -- http://bl.ocks.org/rkirsling/5001347
 *****************************************************************************/

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
    dg_positions = [[0,0.45],[0.30,0],[0.45,0.75],[0,0.25],[0.15,0]]
  }else{
    for (i=0;i<N;i++)
      dg_positions[i] = [Math.random(),Math.random()]
  }

  // generate the graph with matrix data


  // make nodes
  for(i=0;i<N;i++){
    dg.nodes.push({
      id: 'n'+i,
      //label: 'User '+(i+1)+' ['+Math.round(participation.spk_avg['user_'+(i+1)].p_spk)+'%]',
      label: 'User '+(i+1),
      x: dg_positions[i][0],
      y: dg_positions[i][1],
      size: participation.spk_avg['user_'+(i+1)].p_spk/100,
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

                    // scaling


                    // label settings
                    fontStyle: "font-size: 0.85em",

                    // edges settings
                    minNodeSize: 5,
                    maxNodeSize: 15,
                    minEdgeSize: 1,
                    maxEdgeSize: 4
                  }
                });
  s.refresh();
  return s;
}

function draw_directed_graph2(matrix,part){
  // set up SVG for D3
  var width  = 250,
      height = 350,
      colors = d3.scale.category10();

   var svg = d3.select('div#directed_graph') 
    .append('svg')
    .attr('oncontextmenu', 'return false;')
    .attr('width', width)
    .attr('height', height);

  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - reflexive edges are indicated on the node (as a bold black circle).
  //  - links are always source < target; edge directions are set by 'left' and 'right'.


  /* create the nodes from the matrix */ 
  var users = matrix.length;
  var nodes_list = [];
  var nodes_links = [];

  /* nodes */
  for (i=0;i<users;i++){
    nodes_list[i] = {id: (i+1), reflexive: true};
  }

  /* nodes links */
  for (i=0;i<users;i++){
    for (j=0;j<users;j++){
      if (matrix[i][j] >= 1){
        nodes_links.push({source: i, target: j, left: false, right: true });
      }
    }
  }

  var nodes = nodes_list,
    lastNodeId = users,
    links = nodes_links;

  // init D3 force layout
  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-500)
      .on('tick', tick)

  // define arrow markers for graph links
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

  // line displayed when dragging new nodes
  var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

  // handles to link and node element groups
  var path = svg.append('svg:g').selectAll('path'),
      circle = svg.append('svg:g').selectAll('g');

  // mouse event vars
  var selected_node = null,
      selected_link = null,
      mousedown_link = null,
      mousedown_node = null,
      mouseup_node = null;

  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  // update force layout (called automatically each iteration)
  function tick() {
    // draw directed edges with proper padding from node centers
    path.attr('d', function(d) {
      var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = d.left ? 17 : 12,
          targetPadding = d.right ? 17 : 12,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY);
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    circle.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }

  // update graph (called when needed)
  function restart() {
    // path (link) group
    path = path.data(links);

    // update existing links
    path.classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


    // add new links
    path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) return;

        // select link
        mousedown_link = d;
        if(mousedown_link === selected_link) selected_link = null;
        else selected_link = mousedown_link;
        selected_node = null;
        restart();
      });

    // remove old links
    path.exit().remove();


    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(nodes, function(d) { return d.id; });

    // update existing nodes (reflexive & selected visual states)
    circle.selectAll('circle')
      .style('fill', function(d) { return user_colors[d.id-1]})
      .classed('reflexive', function(d) { return d.reflexive; });

    // add new nodes
    var g = circle.enter().append('svg:g');

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', 12)
      .style('fill', function(d) { return user_colors[d.id-1]})
      //.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
      .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
      .classed('reflexive', function(d) { return d.reflexive; })
      .on('mouseover', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // enlarge target node
        d3.select(this).attr('transform', 'scale(1.1)');
      })
      .on('mouseout', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // unenlarge target node
        d3.select(this).attr('transform', '');
      })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) return;

        restart();
      })
      .on('mouseup', function(d) {
        if(!mousedown_node) return;

        // needed by FF
        drag_line
          .classed('hidden', true)
          .style('marker-end', '');

        // check for drag-to-self
        mouseup_node = d;
        if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

        // unenlarge target node
        d3.select(this).attr('transform', '');

        restart();
      });

    // show node IDs
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'id')
        .text(function(d) { return d.id; });

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
  }

  function mousedown() {
    restart();
  }

  function mousemove() {
    if(!mousedown_node) return;

    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
  }

  function mouseup() {
    if(mousedown_node) {
      // hide drag line
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');
    }

    // because :active only works in WebKit?
    svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
  }

  function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
      return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
      links.splice(links.indexOf(l), 1);
    });
  }

  // only respond once per keydown
  var lastKeyDown = -1;

  function keydown() {
    d3.event.preventDefault();

    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle.call(force.drag);
      svg.classed('ctrl', true);
    }

    if(!selected_node && !selected_link) return;
    switch(d3.event.keyCode) {
      case 8: // backspace
      case 46: // delete
        if(selected_node) {
          nodes.splice(nodes.indexOf(selected_node), 1);
          spliceLinksForNode(selected_node);
        } else if(selected_link) {
          links.splice(links.indexOf(selected_link), 1);
        }
        selected_link = null;
        selected_node = null;
        restart();
        break;
      case 66: // B
        if(selected_link) {
          // set link direction to both left and right
          selected_link.left = true;
          selected_link.right = true;
        }
        restart();
        break;
      case 76: // L
        if(selected_link) {
          // set link direction to left only
          selected_link.left = true;
          selected_link.right = false;
        }
        restart();
        break;
      case 82: // R
        if(selected_node) {
          // toggle node reflexivity
          selected_node.reflexive = !selected_node.reflexive;
        } else if(selected_link) {
          // set link direction to right only
          selected_link.left = false;
          selected_link.right = true;
        }
        restart();
        break;
    }
  }

  function keyup() {
    lastKeyDown = -1;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle
        .on('mousedown.drag', null)
        .on('touchstart.drag', null);
      svg.classed('ctrl', false);
    }
  }

  // app starts here
  svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
  d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
  restart();

}
