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
  //d.setAttribute('style', 'padding-top:30px;margin:0px 20px 0 20px');
  d.appendChild(t);

  var m = document.getElementById("main");
  while (m.firstChild) {m.removeChild(m.firstChild)}
  m.appendChild(d);
}

function getDataByID(id,data) {
  var row = JSON.parse(data).find(function(e) {
    return e.ID == id
  });
  return row;
}

function build_team_info(data){
  var tr=document.createElement('tr');
  function newtd(html) {
    var td=document.createElement('td');
    td.innerHTML=html;
    tr.appendChild(td);
  }
  newtd('<span style=font-size:1.2em>'+data.Name+'</span><br>'+data.Chef+'');
  //newtd('<span class="lbl"><div class="ui yellow label">1</div> '+data.R1+'</span> <span class="lbl"><div class="ui yellow label">2</div> '+data.R2+'</span> <span class="lbl"><div class="ui yellow label">3</div> '+data.R3+'</span> <span class="lbl"><div class="ui yellow label">4</div> '+data.R4+'</span> <span class="lbl"><div class="ui yellow label">5</div> '+data.R5+'</span> <span class="lbl"><div class="ui label">Ersatzläufer</div> '+data.Standby+'');
  //function build_member(pos,text) {return '<div class="ui label"><div class="ui yellow label small circular">'+pos+'</div> '+text+'</div>';}
  //newtd(build_member(1,data.R1)+build_member(2,data.R2)+build_member(3,data.R3)+build_member(4,data.R4)+build_member(5,data.R5)+build_member('Ersatz',data.Standby));
  newtd(data.R1); newtd(data.R2); newtd(data.R3); newtd(data.R4); newtd(data.R5); newtd(data.Standby);
  //newtd('<button class="ui large button" onclick="formshow(\''+data.ID+'\')">edit</button>');
  newtd('<div onclick="formshow(\''+data.ID+'\')" class="ui vertical animated button" tabindex="0"><div class="hidden content">edit</div><div class="visible content"><i class="edit icon"></i></div></div>');
  return tr;
}

var socket = io();
socket.emit('data');

var _data={};
socket.on('data', function (data){
  _data=data;
  update(data);
});

function reload_from_db() {
  socket.emit('reload_from_db');
};

function update_all_clients() {
  socket.emit('update_all_clients');
};

function formshow(id){
  $('#master').dimmer('show');
  $('.form').transition('hide');
  $('.form').transition('vertical flip');
  var team=getDataByID(id,_data);
  $('#Name').val(team.Name);
  $('#Chef').val(team.Chef);
  $('#R1').val(team.R1);
  $('#R2').val(team.R2);
  $('#R3').val(team.R3);
  $('#R4').val(team.R4);
  $('#R5').val(team.R5);
  $('#Standby').val(team.Standby);
  $('#Name').focus();
};

$('#btn_submit').click(function(){
  $('.form').transition('vertical flip');
  $('#master').dimmer('hide');
});

$('#reload_from_db').click(function(){reload_from_db()});
$('#update_all_clients').click(function(){update_all_clients()});

$('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  })
;
