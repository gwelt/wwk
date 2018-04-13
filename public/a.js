function update_view(data) {
  data=JSON.parse(data);

  var t = document.createElement('table');
  t.setAttribute('class', 'ui very basic selectable table');

  var tbody = document.createElement('tbody');
  i=0;
  while (i<data.length) {
    tbody.appendChild(build_team_info(data[i]));
    i++;
  }
  t.appendChild(tbody);

  var m = document.getElementById("main");
  while (m.firstChild) {m.removeChild(m.firstChild)}
  m.appendChild(t);
}

function getDataByID(id,data) {
  var d=JSON.parse(data), i=0;
  while (i<d.length && d[i].ID!=id) {i++}
  return i<d.length?d[i]:false;
}

function build_team_info(data){
  var tr=document.createElement('tr');
  function newtd(html) {
    var td=document.createElement('td');
    td.innerHTML=html;
    tr.appendChild(td);
  }
  newtd('<span style=font-size:1.2em>'+data.Name+'</span><br>'+data.ID+' / '+data.Chef+'');
  newtd(data.R1); newtd(data.R2); newtd(data.R3); newtd(data.R4); newtd(data.R5); newtd('<span style="font-style:italic">'+data.Standby+'</span>');
  tr.onclick=function(){formshow(data.ID)};
  tr.style.cursor='pointer';
  //tr.style.background='#e0e0e0';
  return tr;
}

var socket = io();
socket.emit('get_data');

var _data={};
socket.on('data', function (data){
  _data=data;
  update_view(data);
});

function reload_from_db() {
  socket.emit('reload_from_db');
};

function update_all_clients() {
  socket.emit('update_all_clients');
};

function Team(ID,Name,Chef,R1,R2,R3,R4,R5,Standby) {
  this.ID=ID;
  this.Name=Name;
  this.Chef=Chef;
  this.R1=R1;
  this.R2=R2;
  this.R3=R3;
  this.R4=R4;
  this.R5=R5;
  this.Standby=Standby;
}

function write_to_db(token,data) {
  socket.emit('write_to_db', {token:token, data:data});
};

var id=0;
function formshow(_id){
  id=_id;
  $('.long.modal')
   .modal('show')
  ;

  var team=getDataByID(id,_data);
  $('#TeamID').text('Team mit Startnummer '+team.ID+'');
  $('#Name').val(team.Name);
  $('#Chef').val(team.Chef);
  $('#R1').val(team.R1);
  $('#R2').val(team.R2);
  $('#R3').val(team.R3);
  $('#R4').val(team.R4);
  $('#R5').val(team.R5);
  $('#Standby').val(team.Standby);
  $('#token').val('');
};

$('#btn_submit').click(function(){
  write_to_db($('#token').val(),JSON.stringify(new Team(id,$('#Name').val(),$('#Chef').val(),$('#R1').val(),$('#R2').val(),$('#R3').val(),$('#R4').val(),$('#R5').val(),$('#Standby').val())));
  $('.long.modal')
   .modal('hide')
  ;
});

$('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  })
;
