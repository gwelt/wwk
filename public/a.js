function update(data) {
  data=JSON.parse(data);

  var t = document.createElement('table');
  t.setAttribute('class', 'ui very basic table');
  t.appendChild(document.createElement('thread')).appendChild(document.createElement('tr')).appendChild(document.createElement('th')).appendChild(document.createTextNode('Headline'));
  t.appendChild(document.createElement('tbody'));

  i=0;
  while (i<data.length) {
    t.appendChild(build_team_info(data[i]));
    i++;
  }

  var m = document.getElementById("main");
  while (m.firstChild) {m.removeChild(m.firstChild)}
  m.appendChild(t);
}

function build_team_info(data){
  var tr=document.createElement('tr');
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.Name));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.Chef));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R1));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R2));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R3));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R4));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R5));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.Standby));
  return tr;
}

var socket = io();
//socket.emit('data');

socket.on('data', function (data){
  update(data);
});

function formshow(){
  $('#master').dimmer('show');
  $('.form').transition('hide');
  $('.form').transition('vertical flip');
  $('#name').focus();
};

$('.shape').click(function(){
  $(this).shape('flip over');
});

$('#btn').click(function(){
  $('.form').transition('vertical flip');
  $('#master').dimmer('hide');
});

$('#btn2').click(function(){formshow()});
$('#reload_from_db').click(function(){socket.emit('reload_from_db')});
$('#update_all_clients').click(function(){socket.emit('update_all_clients')});
