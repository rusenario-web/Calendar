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
  return st.events.filter(function(e){return e.date===s||(e.rep&&pd(e.date).getDay()===w&&e.date<=s&&(!e.until||s<=e.until))}).sort(function(a,b){return a.start.localeCompare(b.start)})}
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
  $("jm").value=c.getMonth();$("jy").value=c.getFullYear();
  $("vw").className=st.view==="week"?"on":"";$("vm").className=st.view==="month"?"on":"";
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function open(ev,date,time){
  st.editing=ev?ev.id:null;
  $("dt").textContent=ev?"Edit event":"Add event";
  $("f-title").value=ev?ev.title:"";$("f-date").value=ev?ev.date:date||ds(new Date());
  $("f-start").value=ev?ev.start:time||"08:00";
  $("f-end").value=ev?ev.end:time?String(Math.min(+time.slice(0,2)+1,23)).padStart(2,"0")+":00":"09:00";
  $("f-rep").checked=ev?!!ev.rep:false;$("f-until").value=ev?ev.until||"":"";$("f-note").value=ev?ev.note||"":"";
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
  if($("f-rep").checked&&$("f-until").value&&$("f-until").value<$("f-date").value){alert("The repeat-until date must be on or after the start date.");return}
  var o={id:st.editing||"e"+Date.now(),title:t,date:$("f-date").value,start:a,end:b,color:st.color,rep:$("f-rep").checked,until:$("f-rep").checked?$("f-until").value:"",note:$("f-note").value};
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
var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
$("jm").innerHTML=MONTHS.map(function(m,i){return '<option value="'+i+'">'+m+'</option>'}).join("");
var yo="";for(var yy=1900;yy<=2100;yy++)yo+='<option value="'+yy+'">'+yy+'</option>';
$("jy").innerHTML=yo;
function jump(){var y=+$("jy").value,m=+$("jm").value,d=Math.min(st.cur.getDate(),new Date(y,m+1,0).getDate());st.cur=new Date(y,m,d);render()}
$("jm").onchange=jump;$("jy").onchange=jump;
var o=load();document.documentElement.dataset.accent="ocean";
if(o){if(o.accent){$("accent").value=o.accent;document.documentElement.dataset.accent=o.accent}if(o.theme)document.documentElement.dataset.theme=o.theme}
if(!o||!st.events.length&&!o)seed();
render();

/* ===== Import schedule from a file ===== */
var LIBS={tess:"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",pdf:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",mam:"https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"},libOk={};
function loadLib(k){return new Promise(function(res,rej){
  if(libOk[k])return res();
  var s=document.createElement("script");s.src=LIBS[k];
  s.onload=function(){libOk[k]=1;if(k==="pdf")pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";res()};
  s.onerror=function(){rej(new Error("Could not load the file reader. Please check your internet connection and try again."))};
  document.head.appendChild(s)})}

/*PARSER-START*/
var DAYRE=/\b(mwf|tth|sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?)\b/gi;
var TRE=/(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\s*(?:-|–|—|to|until)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/i;
var MON=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function pad(n){return String(n).padStart(2,"0")}
function hm(n){return pad(Math.floor(n/60))+":"+pad(n%60)}
function dayNums(s){var out=[],m,map={su:0,mo:1,tu:2,we:3,th:4,fr:5,sa:6};DAYRE.lastIndex=0;
  while((m=DAYRE.exec(s))){var w=m[1].toLowerCase(),a=w==="mwf"?[1,3,5]:w==="tth"?[2,4]:[map[w.slice(0,2)]];
    a.forEach(function(n){if(out.indexOf(n)<0)out.push(n)})}
  return out}
function clock(h,mi,mer){h=+h;mi=+(mi||0);if(mer==="p"&&h<12)h+=12;if(mer==="a"&&h===12)h=0;return h*60+mi}
function parseRange(m,allowBare){
  var h1=+m[1],h2=+m[4],a1=m[3]?m[3][0].toLowerCase():"",a2=m[6]?m[6][0].toLowerCase():"",S,E;
  if(h1>24||h2>24||(m[2]&&+m[2]>59)||(m[5]&&+m[5]>59))return null;
  if(a1||a2){S=clock(h1,m[2],a1||a2);E=clock(h2,m[5],a2||a1);
    if(!a1&&S>=E)S=clock(h1,m[2],"a");
    if(E<=S&&!a2)E+=720}
  else{if(!(m[2]||m[5])&&!allowBare)return null;
    S=h1*60+ +(m[2]||0);E=h2*60+ +(m[5]||0);
    if(h1>=1&&h1<=6)S+=720;if(E<=S)E+=720}
  if(S>=E||E>1439)return null;
  return{s:S,e:E}}
function mkDate(y,mo,d,txt){if(mo<1||mo>12||d<1||d>31)return null;return{date:y+"-"+pad(mo)+"-"+pad(d),text:txt}}
function findDate(s){var m,y=st.cur.getFullYear();
  if((m=s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/)))return mkDate(+m[1],+m[2],+m[3],m[0]);
  if((m=s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)))return mkDate(m[3]?(m[3].length===2?2000+ +m[3]:+m[3]):y,+m[1],+m[2],m[0]);
  if((m=s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/i)))return mkDate(m[3]?+m[3]:y,MON.indexOf(m[1].toLowerCase())+1,+m[2],m[0]);
  return null}
function wdDate(w){var s=new Date(st.cur);s.setDate(s.getDate()-s.getDay()+w);return ds(s)}
function tidy(s){return s.replace(/^\s*\d+[.)]\s+/,"").replace(/(^|\s)[|,;:•–—\-_]+(?=\s|$)/g," ").replace(/\s+/g," ").replace(/^[\s|,;:•\-–—.&]+|[\s|,;:•\-–—.&]+$/g,"").replace(/^(?:and|&)\s+/i,"").slice(0,60)}
function parseLines(lines){
  var items=[],ctx=[],pend=null;
  lines.forEach(function(raw){
    var line=String(raw).replace(/\s+/g," ").trim();if(!line)return;
    var work=line,dt=findDate(work);if(dt)work=work.replace(dt.text," ");
    var days=dayNums(work),m=work.match(TRE),rng=m?parseRange(m,days.length>0||ctx.length>0):null;
    if(!rng){
      var words=work.replace(DAYRE," ").replace(/[^A-Za-z]/g,"");
      if(pend&&words.length>=2&&!days.length){var t=tidy(work);pend.forEach(function(it){it.title=t});pend=null;return}
      if(days.length){ctx=days;pend=null}
      return}
    var title=tidy(work.replace(TRE," ").replace(DAYRE," ")),use=days.length?days:ctx,made=[],base={start:hm(rng.s),end:hm(rng.e)};
    if(dt)made.push(Object.assign({title:title,date:dt.date,rep:false},base));
    else if(use.length)use.forEach(function(w){made.push(Object.assign({title:title,date:wdDate(w),rep:true},base))});
    else made.push(Object.assign({title:title,date:ds(st.cur),rep:false,warn:true},base));
    if(days.length)ctx=days;
    pend=title?null:made;
    items=items.concat(made)});
  items.forEach(function(it){if(!it.title)it.title="Class"});
  return items}
function parseGrid(rows){
  var hi=-1,cols={},i,j;
  for(i=0;i<rows.length&&hi<0;i++){var map={},n=0;
    rows[i].forEach(function(c,j){var d=dayNums(c);if(d.length===1&&c.trim().split(/\s+/).length<=2){map[j]=d[0];n++}});
    if(n>=2){hi=i;cols=map}}
  if(hi<0)return null;
  var items=[];
  for(i=hi+1;i<rows.length;i++){var r=rows[i],tm=null;
    for(j=0;j<r.length&&!tm;j++){if(cols[j]!==undefined)continue;var m=r[j].match(TRE);if(m)tm=parseRange(m,true)}
    if(!tm)continue;
    r.forEach(function(c,j){if(cols[j]===undefined)return;var t=c.replace(/\s+/g," ").trim();
      if(!t||/^[-–—.\s]+$/.test(t))return;
      items.push({title:t.slice(0,60),date:wdDate(cols[j]),start:hm(tm.s),end:hm(tm.e),rep:true})})}
  return items}
var MONRE="january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec";
function monNum(w){return MON.indexOf(w.slice(0,3))+1}
function lastDay(y,m){return new Date(y,m,0).getDate()}
function isoD(y,m,d){return y+"-"+pad(m)+"-"+pad(d)}
function plusY(x){return (+x.slice(0,4)+1)+x.slice(4)}
function parseNoteRange(note){
  var t=" "+String(note||"").toLowerCase()+" ",today=ds(new Date()),ym=t.match(/\b(?:19|20)\d{2}\b/),hasY=!!ym,Y=hasY?+ym[0]:new Date().getFullYear(),
      endKw=/\b(until|till|up to|through|thru|ends?|ending|before|by)\b/.test(t),startKw=/\b(from|starting|starts?|since|beginning|begins?|after)\b/.test(t),r={from:"",to:""},m;
  function done(){if(!hasY){var ref=r.to||r.from;if(ref&&ref<today){if(r.from)r.from=plusY(r.from);if(r.to)r.to=plusY(r.to)}}return r}
  var iso=(t.match(/\b\d{4}-\d{1,2}-\d{1,2}\b/g)||[]).map(function(x){var p=x.split("-");return isoD(+p[0],+p[1],+p[2])}).sort();
  if(iso.length>=2){r.from=iso[0];r.to=iso[iso.length-1];return r}
  if(iso.length===1){if(endKw&&!startKw)r.to=iso[0];else r.from=iso[0];return r}
  var tre=new RegExp("\\b("+MONRE+")\\b\\.?(?:\\s*(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?)?(?:,?\\s*((?:19|20)\\d{2}))?","g"),tk=[];
  while((m=tre.exec(t)))tk.push({m:monNum(m[1]),d:m[2]?+m[2]:0,y:m[3]?+m[3]:0});
  if(!tk.length)return null;
  function key(x,e){return x.m*100+(x.d||(e?31:1))}
  var a=tk[0],b=tk[tk.length-1];
  if(tk.length>=2&&!(a.m===b.m&&a.d===b.d)){
    if(a.y&&!b.y){b.y=a.y;if(key(b,1)<key(a))b.y++}
    else if(b.y&&!a.y){a.y=b.y;if(key(a)>key(b,1))a.y--}
    else if(!a.y&&!b.y){a.y=b.y=Y;if(key(b,1)<key(a))b.y++}
    r.from=isoD(a.y,a.m,a.d||1);r.to=isoD(b.y,b.m,b.d||lastDay(b.y,b.m))}
  else{
    var y=a.y||Y;
    if(a.d){if(endKw&&!startKw)r.to=isoD(y,a.m,a.d);else r.from=isoD(y,a.m,a.d)}
    else if(endKw&&!startKw)r.to=isoD(y,a.m,lastDay(y,a.m));
    else if(startKw&&!endKw)r.from=isoD(y,a.m,1);
    else{r.from=isoD(y,a.m,1);r.to=isoD(y,a.m,lastDay(y,a.m))}}
  return done()}
function applyRange(items,from,to){
  var out=[],skipped=0;
  items.forEach(function(it){
    var o=Object.assign({},it);
    if(!o.rep){if((from&&o.date<from)||(to&&o.date>to)){skipped++;return}out.push(o);return}
    if(from){var d=pd(from),w=pd(o.date).getDay();while(d.getDay()!==w)d.setDate(d.getDate()+1);o.date=ds(d)}
    if(to){o.until=to;if(o.date>to){skipped++;return}}
    out.push(o)});
  return{items:out,skipped:skipped}}
/*PARSER-END*/

async function ocr(src,say){
  await loadLib("tess");
  var r=await Tesseract.recognize(src,"eng",{logger:function(m){if(m.status)say("Reading text… "+(m.progress?Math.round(m.progress*100)+"%":m.status))}});
  return r.data.text}
async function readPdf(f,say){
  await loadLib("pdf");
  var pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,lines=[],total=0,p;
  for(p=1;p<=pdf.numPages;p++){
    var pg=await pdf.getPage(p),tc=await pg.getTextContent(),rows=[];
    tc.items.forEach(function(it){var y=Math.round(it.transform[5]),row=rows.find(function(r){return Math.abs(r.y-y)<=3});if(!row){row={y:y,it:[]};rows.push(row)}row.it.push(it)});
    rows.sort(function(a,b){return b.y-a.y});
    rows.forEach(function(r){r.it.sort(function(a,b){return a.transform[4]-b.transform[4]});
      var t=r.it.map(function(i){return i.str}).join(" ").trim();if(t){lines.push(t);total+=t.length}})}
  if(total<20){lines=[];
    for(p=1;p<=Math.min(pdf.numPages,5);p++){
      say("Scanning page "+p+"…");
      var pg2=await pdf.getPage(p),vp=pg2.getViewport({scale:2}),cv=document.createElement("canvas");
      cv.width=vp.width;cv.height=vp.height;
      await pg2.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;
      lines=lines.concat((await ocr(cv,say)).split("\n"))}}
  return{lines:lines,items:[]}}
async function readDocx(f){
  await loadLib("mam");
  var r=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()}),
      doc=new DOMParser().parseFromString(r.value,"text/html"),lines=[],items=[];
  [].forEach.call(doc.body.children,function(el){
    if(el.tagName==="TABLE"){
      var rows=[].map.call(el.rows,function(tr){return [].map.call(tr.cells,function(c){return c.textContent})}),g=parseGrid(rows);
      if(g&&g.length)items=items.concat(g);else rows.forEach(function(r){lines.push(r.join(" | "))})}
    else if(el.tagName==="UL"||el.tagName==="OL")[].forEach.call(el.children,function(li){lines.push(li.textContent)});
    else lines.push(el.textContent)});
  return{lines:lines,items:items}}

var found=[];
function say(t){$("istatus").textContent=t}
function colorFor(t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;return COLORS[h%COLORS.length]}
async function handleFile(f){
  if(!f)return;
  syncNote();
  var ext=(f.name.split(".").pop()||"").toLowerCase(),res;
  $("ilist").innerHTML="";$("iadd").disabled=true;say("Reading "+f.name+"…");
  try{
    if($("mode2").value==="ai")res={lines:[],items:await aiScan(f,ext,say)};
    else if(f.type.indexOf("image/")===0)res={lines:(await ocr(f,say)).split("\n"),items:[]};
    else if(ext==="pdf")res=await readPdf(f,say);
    else if(ext==="docx")res=await readDocx(f);
    else if(["txt","csv","tsv","md"].indexOf(ext)>=0)res={lines:(await f.text()).split(/\r?\n/),items:[]};
    else if(ext==="doc")throw new Error("Old .doc files are not supported. Open it in Word, save as .docx, and try again.");
    else throw new Error("This file type is not supported. Please use a photo, PDF, .docx or .txt file.");
    raw=res.items.concat(parseLines(res.lines));
    showFound();
  }catch(err){say("⚠️ "+err.message)}}
$("imp-open").onclick=function(){raw=[];$("ilist").innerHTML="";say("");$("iadd").disabled=true;$("imp").showModal()};
$("icancel").onclick=function(){$("imp").close()};
$("file").onchange=function(){var f=this.files[0];this.value="";handleFile(f)};
$("drop").ondragover=function(e){e.preventDefault();this.classList.add("over")};
$("drop").ondragleave=function(){this.classList.remove("over")};
$("drop").ondrop=function(e){e.preventDefault();this.classList.remove("over");handleFile(e.dataTransfer.files[0])};
$("iadd").onclick=function(){
  var n=0,skip=0,first=null;
  [].forEach.call(document.querySelectorAll("#ilist .irow"),function(r){
    if(!r.querySelector(".ck").checked)return;
    var t=r.querySelector(".it").value.trim()||"Class",d=r.querySelector(".id").value,a=r.querySelector(".is").value,b=r.querySelector(".ie").value;
    if(!d||!a||!b||mins(b)<=mins(a)||(r.querySelector(".ir").checked&&r.querySelector(".iu").value&&r.querySelector(".iu").value<d)||st.events.some(function(e){return e.title===t&&e.date===d&&e.start===a&&e.end===b})){skip++;return}
    st.events.push({id:"i"+Date.now()+"_"+n,title:t,date:d,start:a,end:b,color:colorFor(t),rep:r.querySelector(".ir").checked,until:r.querySelector(".ir").checked?r.querySelector(".iu").value:"",note:$("inote").value.trim()||"Imported from file"});
    if(!first)first=d;n++});
  if(first)st.cur=pd(first);
  save();render();$("imp").close();
  if(n||skip)alert("Added "+n+" event(s)"+(skip?" ("+skip+" skipped: duplicates or invalid times)":"")+".")};

/* ===== AI scan (optional, uses the person's own Anthropic API key) ===== */
var AI_MODEL="claude-sonnet-5-5"; // change this if you want to use a different Claude model
function normT(t){var p=String(t).split(":");return pad(+p[0])+":"+pad(+p[1])}
function aiItems(arr){
  var out=[];
  (Array.isArray(arr)?arr:[]).forEach(function(x){
    if(!x||!x.title||!/^\d{1,2}:\d{2}$/.test(x.start||"")||!/^\d{1,2}:\d{2}$/.test(x.end||""))return;
    var a=normT(x.start),b=normT(x.end),t=String(x.title).slice(0,60);
    if(mins(b)<=mins(a))return;
    if(/^\d{4}-\d{2}-\d{2}$/.test(x.date||""))out.push({title:t,date:x.date,start:a,end:b,rep:!!x.weekly});
    else if(Array.isArray(x.days)&&x.days.length)x.days.forEach(function(w){if(w>=0&&w<=6)out.push({title:t,date:wdDate(+w),start:a,end:b,rep:x.weekly!==false})});
    else out.push({title:t,date:ds(st.cur),start:a,end:b,rep:false,warn:true})});
  return out}
function b64(buf){var s="",u=new Uint8Array(buf),i;for(i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)}
function shrink(f){return new Promise(function(res,rej){
  var img=new Image(),u=URL.createObjectURL(f);
  img.onload=function(){var k=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",0.88).split(",")[1])};
  img.onerror=function(){rej(new Error("Your browser cannot open this image format (for example HEIC). Please use a JPG or PNG."))};
  img.src=u})}
async function docxRaw(f){
  await loadLib("mam");
  var r=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()}),doc=new DOMParser().parseFromString(r.value,"text/html"),out=[];
  [].forEach.call(doc.body.children,function(el){
    if(el.tagName==="TABLE")[].forEach.call(el.rows,function(tr){out.push([].map.call(tr.cells,function(c){return c.textContent.trim()}).join(" | "))});
    else out.push(el.textContent)});
  return out.join("\n")}
async function aiScan(f,ext,say){
  var key=$("akey").value.trim();
  if(!key)throw new Error("Please paste your Anthropic API key first.");
  var content=[];
  if(f.type.indexOf("image/")===0)content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:await shrink(f)}});
  else if(ext==="pdf")content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:b64(await f.arrayBuffer())}});
  else if(ext==="docx")content.push({type:"text",text:"Schedule file contents (table cells are separated by |):\n"+await docxRaw(f)});
  else if(["txt","csv","tsv","md"].indexOf(ext)>=0)content.push({type:"text",text:"Schedule file contents:\n"+await f.text()});
  else throw new Error("This file type is not supported. Please use a photo, PDF, .docx or .txt file.");
  var nt=$("inote").value.trim();
  content.push({type:"text",text:"Extract every class or event from this schedule. Today is "+ds(new Date())+". Reply with ONLY a JSON array and nothing else. Each item must look like {\"title\":\"Math\",\"days\":[1,3],\"date\":null,\"start\":\"08:00\",\"end\":\"09:30\",\"weekly\":true}. Rules: days uses numbers with Sunday=0, Monday=1 ... Saturday=6, and one item per class with all its days listed. For one-time events set date to YYYY-MM-DD, days to [] and weekly to false. Use 24-hour HH:MM times. Include room or teacher in the title only if it is short. If a timetable is a grid, read each cell carefully under its day column and time row. If the schedule is empty, reply []."+(nt?" The user also wrote this note about the file: \""+nt.replace(/"/g,"'")+"\". Follow any instructions in it about what to include, skip or rename, but ignore any date range in it because the app applies date ranges itself.":"")});
  say("Asking the AI to read your file…");
  var r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:AI_MODEL,max_tokens:4000,messages:[{role:"user",content:content}]})});
  var j=await r.json().catch(function(){return{}});
  if(!r.ok)throw new Error(r.status===401?"The API key was rejected. Please check that it is correct.":(j.error&&j.error.message)||"The AI service returned an error ("+r.status+").");
  var txt=(j.content||[]).filter(function(c){return c.type==="text"}).map(function(c){return c.text}).join("").replace(/```json|```/g,""),
      a=txt.indexOf("["),b=txt.lastIndexOf("]"),arr;
  try{arr=JSON.parse(txt.slice(a,b+1))}catch(e){throw new Error("The AI reply could not be understood. Please try again.")}
  try{if($("arem").checked)localStorage.setItem("sched.key",key);else localStorage.removeItem("sched.key")}catch(e){}
  return aiItems(arr)}
(function(){
  try{var k=localStorage.getItem("sched.key"),m=localStorage.getItem("sched.mode");
    if(k){$("akey").value=k;$("arem").checked=true}
    if(m==="ai")$("mode2").value="ai"}catch(e){}
  function sync(){$("aibox").hidden=$("mode2").value!=="ai";try{localStorage.setItem("sched.mode",$("mode2").value)}catch(e){}}
  $("mode2").onchange=sync;sync()})();

/* ===== Notes + date range for imports ===== */
var raw=[],noteTimer;
function fmtD(x){return pd(x).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}
function syncNote(){
  var n=$("inote").value.trim(),h=$("inhint");
  if(!n){h.textContent="";return}
  var r=parseNoteRange(n);
  if(r){$("ifrom").value=r.from;$("ito").value=r.to;
    h.textContent="Dates found in your note: "+(r.from?fmtD(r.from):"no start date")+" to "+(r.to?fmtD(r.to):"no end date")+". You can change them below."}
  else h.textContent="I could not find dates in your note, so nothing is limited yet. You can set the dates below."}
function showFound(){
  var from=$("ifrom").value,to=$("ito").value,box=$("ilist");
  if(!raw.length){box.innerHTML="";$("iadd").disabled=true;say("I could not find any class times in this file. Try a clearer photo, try the AI scan, or use a file with lines like “Monday 8:00-9:30 Math”.");return}
  var r=applyRange(raw,from,to);found=r.items;
  if(!found.length){box.innerHTML="";$("iadd").disabled=true;say("Everything in the file falls outside the dates you chose. Please change the start and end dates above.");return}
  say("Found "+found.length+" item(s)"+(from||to?" for "+(from?fmtD(from):"the start")+" to "+(to?fmtD(to):"no end date"):"")+(r.skipped?" ("+r.skipped+" outside those dates were left out)":"")+". Check them, fix anything that looks wrong, untick what you do not want, then add.");
  box.innerHTML=found.map(function(it){
    return '<div class="irow"><input type="checkbox" class="ck" checked><input type="text" class="it" value="'+esc(it.title)+'"><input type="date" class="id" value="'+it.date+'" min="1900-01-01" max="2100-12-31"><input type="time" class="is" value="'+it.start+'"><input type="time" class="ie" value="'+it.end+'"><label><input type="checkbox" class="ir"'+(it.rep?" checked":"")+'> weekly</label><label>until <input type="date" class="iu" value="'+(it.until||"")+'" min="1900-01-01" max="2100-12-31"></label>'+(it.warn?'<span title="No day was found, please set the date">⚠️</span>':"")+'</div>'}).join("");
  $("iadd").disabled=false}
$("inote").oninput=function(){clearTimeout(noteTimer);noteTimer=setTimeout(function(){syncNote();if(raw.length)showFound()},500)};
$("ifrom").onchange=$("ito").onchange=function(){if(raw.length)showFound()};
