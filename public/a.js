
function update_view() {
  data=JSON.parse(_data);

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

  update_counter();
}

function getDataByID(id,data) {
  var d=JSON.parse(data), i=0;
  while (i<d.length && d[i].ID!=id) {i++}
  return i<d.length?d[i]:false;
}

function build_team_info(data){
  var tr=document.createElement('tr');
  function newtd(html,id) {
    var td=document.createElement('td');
    if (id!=undefined) {td.id='TD'+id}
    td.innerHTML=html;
    tr.appendChild(td);
  }
  newtd('<span style="font-size:1.2em">'+data.Name+'</span><br><span style="font-size:1.0em">'+data.ID+' / '+data.Chef+'</span>');
  newtd(data.R1); newtd(data.R2); newtd(data.R3); newtd(data.R4); newtd(data.R5); newtd('<span style="font-style:italic">'+data.Standby+'</span>');

  var info='';
  if (data.R1!=''&&data.R2!=''&&data.R3!=''&&data.R4!=''&&data.R5!='') {info='<a class="ui blue label">ready to start</a>'}
  newtd(info,'_info_'+data.ID);

  tr.id='TR'+data.ID;
  tr.onclick=function(){formshow(data.ID)};
  tr.style.cursor='pointer';
  return tr;
}

function highlight(info) {
  document.getElementById('TR'+info.ID).style.transition='background-color 4200ms ease-in';
  $('#TR'+info.ID).transition({
    animation: 'fade up',
    onComplete : function() {
      document.getElementById('TR'+info.ID).style.background='#ffffff';
      document.getElementById('TD_info_'+info.ID).innerHTML='<a class="ui '+info.color+' label">'+info.info+'</a>';
      $('#TR'+info.ID).transition({
        animation: 'swing down',
        onComplete : function() {
          document.getElementById('TR'+info.ID).style.backgroundColor='inherit';
          setTimeout(function(){document.getElementById('TR'+info.ID).style.transition='background-color 0ms linear';},0);
        }
      });
    }
  });
}

var its_ok_to_update_counter_again=true;
function update_counter() {
  if ((its_ok_to_update_counter_again)&&(_data.length>100)) {
    its_ok_to_update_counter_again=false;

    data=JSON.parse(_data);
    var _stat='{"staffeln":"0","laeufer":"0","kilometer":"0"}';
    var stat=JSON.parse(_stat);
    
    var i=0;
    while (i<data.length) {
      if (data[i].Chef!="") {stat.staffeln++}
      if (data[i].R1!="") {stat.laeufer++}; if (data[i].R2!="") {stat.laeufer++}; if (data[i].R3!="") {stat.laeufer++}; if (data[i].R4!="") {stat.laeufer++}; if (data[i].R5!="") {stat.laeufer++};
      i++;
    }
    stat.kilometer=stat.laeufer*5;
    
    animate_counter($('#staffeln_count'),0,stat.staffeln,2000);
    animate_counter($('#laeufer_count'),0,stat.laeufer,2600);
    animate_counter($('#kilometer_count'),0,stat.kilometer,3200);

    setTimeout(function(){its_ok_to_update_counter_again=true},8000);
  }
}

function animate_counter(element,current,target,time) {
  element.html(++current);
  if ((current<target)&&(current<1000)) {
    setTimeout(function(){animate_counter(element,current,target,time)},Math.round(time/target));
  }
}

if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(){update_counter()}, {});
  var target = document.querySelector('#staffeln_count');
  observer.observe(target);
}

var socket = io();
setTimeout(function(){socket.emit('get_data')},0);

var _data={};
socket.on('data', function (data) {
  _data=data;
  update_view();
});

socket.on('info', function (info) {
  highlight(info)
});

socket.on('authresult', function (auth) {
  //console.log('ID:'+auth.id+' CODE:'+auth.code+' RESULT:'+auth.result);
  if (auth.result) {
    $('#codediv').removeClass('error');
    $('#cancel').removeClass('primary');
    $('#btn_submit').addClass('primary');
  } else {
    $('#codediv').addClass('error')
    $('#cancel').addClass('primary');
    $('#btn_submit').removeClass('primary');
  }
});

function auth(id,code) {
  socket.emit('auth', {'id':id,'code':code})
}

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

function write_to_db(code,data) {
  socket.emit('write_to_db', {code:code, data:data});
};

var id=0;
function formshow(_id){
  id=_id;
  $('.long.modal').modal('show');
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
  $('#code').val('');
  $('#code').val('ERGO'+team.ID);
  auth(id,$('#code').val());
};

$('#code').keyup(function(){
  auth(id,$('#code').val());
});

$('#btn_submit').click(function(){
  write_to_db($('#code').val(),JSON.stringify(new Team(id,$('#Name').val(),$('#Chef').val(),$('#R1').val(),$('#R2').val(),$('#R3').val(),$('#R4').val(),$('#R5').val(),$('#Standby').val())));
  $('.long.modal').modal('hide');
});
