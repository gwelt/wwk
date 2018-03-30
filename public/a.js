function update(data) {
  data=JSON.parse(data);

  var t = document.createElement('table');
  t.setAttribute('class', 'ui very basic table');
  //var thread = document.createElement('tbody'); //thread
  //thread.innerHTML='<thread><tr><th>Team-Name</th><th>Team-Chef</th><th>Läufer 1</th><th>Läufer 2</th><th>Läufer 3</th><th>Läufer 4</th><th>Läufer 5</th><th>Ersatzläufer</th></tr></thread>';
  //t.appendChild(thread);

  var tbody = document.createElement('tbody');
  i=0;
  while (i<data.length) {
    tbody.appendChild(build_team_info(data[i]));
    i++;
  }
  t.appendChild(tbody);

  var b1 = document.createElement('button');
  b1.setAttribute('class', 'ui large floated button');
  b1.id='update_all_clients';
  b1.innerHTML='update_all_clients';

  var b2 = document.createElement('button');
  b2.setAttribute('class', 'ui large floated button');
  b2.id='reload_from_db';
  b2.innerHTML='reload_from_db';
  b2.onclick='javascript:reload_from_db()';

  var d = document.createElement('div');
  d.setAttribute('style', 'padding-top:30px;margin:0px 20px 0 20px');
  d.appendChild(t);
  d.appendChild(b1);
  d.appendChild(b2);

  var m = document.getElementById("main");
  while (m.firstChild) {m.removeChild(m.firstChild)}
  m.appendChild(d);
}

function build_team_info(data){
  var tr=document.createElement('tr');
  function newtd(html) {
    var td=document.createElement('td');
    td.innerHTML=html;
    tr.appendChild(td);
  }
  newtd('<span style=font-size:1.4em>'+data.Name+'</span><br>'+data.Chef+'');
  newtd('[1] '+data.R1+' > [2] '+data.R2+' > [3] '+data.R3+' > [4] '+data.R4+' > [5] '+data.R5+'<br>Ersatzläufer: '+data.Standby+'');
  /*
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R1));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R2));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R3));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R4));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.R5));
  tr.appendChild(document.createElement('td')).appendChild(document.createTextNode(data.Standby));
  */
  return tr;
}

var socket = io();
socket.emit('data');

socket.on('data', function (data){
  update(data);
});

function reload_from_db() {
  socket.emit('reload_from_db');
};

function formshow(){
  $('#master').dimmer('show');
  $('.form').transition('hide');
  $('.form').transition('vertical flip');
  $('#name').focus();
};

$('#btn_edit').click(function(){formshow()});
$('#btn_submit').click(function(){
  $('.form').transition('vertical flip');
  $('#master').dimmer('hide');
});

$('#reload_from_db').click(function(){socket.emit('reload_from_db')});
$('#update_all_clients').click(function(){socket.emit('update_all_clients')});
