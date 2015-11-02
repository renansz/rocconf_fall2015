google.load("visualization", "1", {packages:["timeline"]});
google.setOnLoadCallback(drawChart);

function drawChart() {
  var container = document.getElementById('project-timeline');
  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();

  dataTable.addColumn({ type: 'string', id: 'Task' });
  dataTable.addColumn({ type: 'string', id: 'Label' });
  dataTable.addColumn({ type: 'string', role: 'tooltip', id: 'Responsible' });
  dataTable.addColumn({ type: 'date', id: 'Start' });
  dataTable.addColumn({ type: 'date', id: 'End' });
  dataTable.addRows([
    [ 'Project Proposal',null,'All members',new Date(2015, 9, 18), new Date(2015, 9, 25)],
    [ 'Concept Video',null,'All members',new Date(2015, 9, 18), new Date(2015, 9, 25)],
    [ 'Needfinding Survey',null,'Zhiming, Jeff, Bella',new Date(2015, 9, 25), new Date(2015, 10, 1)],
    [ 'Paper Prototype',null,'Vincent, Eric, Zhiming',new Date(2015, 10, 1),  new Date(2015, 10, 6)],
    [ 'Interactive Wireframe',null,'Bella, Zhiming',new Date(2015, 10, 6),  new Date(2015, 10, 10)],
    [ 'Backend Development',null,'Jeff, Eric, Vincent',new Date(2015, 9, 25), new Date(2015, 10, 22)],
    [ 'Frontend Development',null,'Renan, Bella',new Date(2015, 9, 25), new Date(2015, 10, 22)],
    [ 'Backend & Frontend Integration',null,'Renan, Bella, Jeff',new Date(2015, 10, 8), new Date(2015, 10, 22)],
    [ 'User Tests',null,'All members',new Date(2015, 10, 15), new Date(2015, 10, 29)],
    [ 'Demo Video + Poster',null,'All members',new Date(2015, 10, 22), new Date(2015, 10, 29)]]);

  var options = {
    timeline: { singleColor: '#5bc0de' }
  };

  chart.draw(dataTable, options);
}
