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

  var d = document.createElement('div');
  d.setAttribute('style', 'padding-top:30px;margin:0px 20px 0 20px');
  d.appendChild(t);

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

function update_all_clients() {
  socket.emit('update_all_clients');
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

$('#reload_from_db').click(function(){reload_from_db()});
$('#update_all_clients').click(function(){update_all_clients()});
