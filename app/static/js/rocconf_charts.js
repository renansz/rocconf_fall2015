$(document).ready(function(){
  google.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Time', 'Main Video', 'Participant 1', 'Participant 2', 'Participant 3', 'Participant 4'],
      ['1' ,  1000,  400,  1500,  100, 100],
      ['2' ,  100,   400,  1200,  200, 200],
      ['3' ,  2000,  700,  1400,  300, 300],
      ['4' ,  200,   800,  1000,  400, 400],
      ['5' ,  150,   900,  1600,  700, 700],
      ['6' ,  1170,  460,   800,  200, 200],
      ['7' ,  660,   120,   700,  350, 350],
      ['8' ,  1030,  240,   600,  300, 300],
      ['9' ,  1530,  540,   500,  400, 400],
      ['10',  1930,  740,   400,  500, 500]
      ]);

      var options = {
        title: 'Smile Intensity',
        curveType: 'function',
          legend: { position: 'bottom' }
        };

      var chart = new google.visualization.LineChart(document.getElementById('chart-area'));
      chart.draw(data, options);
  }
});
