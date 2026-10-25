var COLORS=["#4f7cff","#ff7a45","#2fa66a","#8b5cf6","#e5484d","#0ea5b7","#d6a100","#d946a8"];
var H0=6,H1=22,PX=48;
var DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var st={events:[],view:"week",cur:new Date(),editing:null,color:COLORS[0]};
var $=function(i){return document.getElementById(i)};
function ds(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function pd(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function mins(t){var p=t.split(":");return +p[0]*60+ +p[1]}
function t12(t){var p=t.split(":"),h=+p[0];return (h%12||12)+":"+p[1]+(h<12?"am":"pm")}
function load(){try{var s=localStorage.getItem("sched.v1");if(s){var o=JSON.parse(s);st.events=o.events||[];return o}}catch(e){}return null}
function save(){try{localStorage.setItem("sched.v1",JSON.stringify({events:st.events,accent:$("accent").value,theme:document.documentElement.dataset.theme||""}))}catch(e){}}
function on(date){var s=ds(date),w=date.getDay();
  return st.events.filter(function(e){return e.date===s||(e.rep&&pd(e.date).getDay()===w&&e.date<=s)}).sort(function(a,b){return a.start.localeCompare(b.start)})}
function seed(){
  var m=new Date();m.setDate(m.getDate()-((m.getDay()+6)%7));
  var rows=[["Mathematics",0,"08:00","09:30",0],["Physics",1,"10:00","11:30",1],["English",2,"09:00","10:00",2],["Chemistry Lab",3,"13:00","15:00",3],["Study Group",4,"16:00","17:30",4],["Basketball",2,"17:00","18:30",5]];
  rows.forEach(function(r,i){var d=new Date(m);d.setDate(m.getDate()+r[1]);st.events.push({id:"s"+i,title:r[0],date:ds(d),start:r[2],end:r[3],color:COLORS[r[4]],rep:true,note:""})});
}
function render(){
  var c=st.cur,v=$("view");
  if(st.view==="week"){
    var s=new Date(c);s.setDate(c.getDate()-c.getDay());
    var e=new Date(s);e.setDate(s.getDate()+6);
    $("ttl").textContent=s.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+e.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    var h='<div class="week"><div class="wh"><div></div>',td=ds(new Date()),i,d;
    for(i=0;i<7;i++){d=new Date(s);d.setDate(s.getDate()+i);h+='<div class="'+(ds(d)===td?"today":"")+'">'+DAYS[i]+'<small>'+d.getDate()+'</small></div>'}
    h+='</div><div class="wb"><div class="hours">';
    for(i=H0;i<H1;i++)h+='<div>'+t12(i+":00")+'</div>';
    h+='</div>';
    for(i=0;i<7;i++){d=new Date(s);d.setDate(s.getDate()+i);
      h+='<div class="col" data-date="'+ds(d)+'">';
      on(d).forEach(function(ev){
        var top=(mins(ev.start)-H0*60)/60*PX,ht=Math.max(22,(mins(ev.end)-mins(ev.start))/60*PX-2);
        h+='<div class="ev" data-id="'+ev.id+'" style="top:'+top+'px;height:'+ht+'px;background:'+ev.color+'"><b>'+esc(ev.title)+'</b>'+t12(ev.start)+" – "+t12(ev.end)+'</div>'});
      h+='</div>'}
    v.innerHTML=h+'</div></div>';
  }else{
    $("ttl").textContent=c.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    var f=new Date(c.getFullYear(),c.getMonth(),1);f.setDate(1-f.getDay());
    var h2='<div class="month">',td2=ds(new Date());
    DAYS.forEach(function(n){h2+='<div class="dow">'+n+'</div>'});
    for(var i2=0;i2<42;i2++){var d2=new Date(f);d2.setDate(f.getDate()+i2);
      var l=on(d2);
      h2+='<div class="cell'+(d2.getMonth()!==c.getMonth()?" out":"")+(ds(d2)===td2?" today":"")+'" data-date="'+ds(d2)+'"><span class="n">'+d2.getDate()+'</span>';
      l.slice(0,3).forEach(function(ev){h2+='<div class="chip" data-id="'+ev.id+'" style="background:'+ev.color+'">'+t12(ev.start)+" "+esc(ev.title)+'</div>'});
      if(l.length>3)h2+='<div class="more">+'+(l.length-3)+' more</div>';
      h2+='</div>'}
    v.innerHTML=h2+'</div>';
  }
  $("vw").className=st.view==="week"?"on":"";$("vm").className=st.view==="month"?"on":"";
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function open(ev,date,time){
  st.editing=ev?ev.id:null;
  $("dt").textContent=ev?"Edit event":"Add event";
  $("f-title").value=ev?ev.title:"";$("f-date").value=ev?ev.date:date||ds(new Date());
  $("f-start").value=ev?ev.start:time||"08:00";
  $("f-end").value=ev?ev.end:time?String(Math.min(+time.slice(0,2)+1,23)).padStart(2,"0")+":00":"09:00";
  $("f-rep").checked=ev?!!ev.rep:false;$("f-note").value=ev?ev.note||"":"";
  st.color=ev?ev.color:COLORS[0];paintSw();
  $("del").style.display=ev?"":"none";
  $("dlg").showModal();
}
function paintSw(){$("sw").innerHTML=COLORS.map(function(c){return '<span data-c="'+c+'" class="'+(c===st.color?"sel":"")+'" style="background:'+c+'"></span>'}).join("")}
$("sw").onclick=function(e){if(e.target.dataset.c){st.color=e.target.dataset.c;paintSw()}};
$("save").onclick=function(){
  var t=$("f-title").value.trim(),a=$("f-start").value,b=$("f-end").value;
  if(!t||!$("f-date").value||!a||!b){alert("Please fill in title, date and times.");return}
  if(mins(b)<=mins(a)){alert("End time must be after start time.");return}
  var o={id:st.editing||"e"+Date.now(),title:t,date:$("f-date").value,start:a,end:b,color:st.color,rep:$("f-rep").checked,note:$("f-note").value};
  var i=st.events.findIndex(function(x){return x.id===o.id});
  if(i>=0)st.events[i]=o;else st.events.push(o);
  $("dlg").close();save();render();
};
$("del").onclick=function(){if(confirm("Delete this event?")){st.events=st.events.filter(function(x){return x.id!==st.editing});$("dlg").close();save();render()}};
$("cancel").onclick=function(){$("dlg").close()};
$("view").onclick=function(e){
  var ev=e.target.closest("[data-id]");
  if(ev){open(st.events.find(function(x){return x.id===ev.dataset.id}));return}
  var cell=e.target.closest("[data-date]");
  if(cell){var time;if(cell.classList.contains("col")){var y=e.clientY-cell.getBoundingClientRect().top;time=String(H0+Math.floor(y/PX)).padStart(2,"0")+":00"}open(null,cell.dataset.date,time)}
};
function shift(n){var c=st.cur;if(st.view==="week")c.setDate(c.getDate()+7*n);else{c.setDate(1);c.setMonth(c.getMonth()+n)}render()}
$("prev").onclick=function(){shift(-1)};$("next").onclick=function(){shift(1)};
$("tod").onclick=function(){st.cur=new Date();render()};
$("add").onclick=function(){open(null,ds(new Date()))};
$("vw").onclick=function(){st.view="week";render()};$("vm").onclick=function(){st.view="month";render()};
$("accent").onchange=function(){document.documentElement.dataset.accent=this.value;save()};
$("mode").onclick=function(){var r=document.documentElement,dark=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=dark?"light":"dark";save()};
var o=load();
if(o){if(o.accent){$("accent").value=o.accent;document.documentElement.dataset.accent=o.accent}if(o.theme)document.documentElement.dataset.theme=o.theme}
if(!o||!st.events.length&&!o)seed();
render();
