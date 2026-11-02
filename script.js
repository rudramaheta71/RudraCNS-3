const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const resultsPanel = $("#results-panel");
let activity = [];

function rand(p){ return Math.random() < p; }
function safeName(name){ return String(name).replace(/[<>&"]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c])); }
function setActive(label){
  $("#crumb-current").textContent = label;
  $$(".nav-item").forEach(b => b.classList.toggle("active",
    (b.dataset.view === "overview" && label === "Overview") ||
    (b.dataset.view === "comparison" && label === "Compare Threats") ||
    (b.dataset.sim && b.dataset.sim === label.toLowerCase().split(" ")[0])
  ));
}
function logActivity(title, subtitle, symbol="✓"){
  const time = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
  activity.unshift({title,subtitle,time,symbol});
  activity = activity.slice(0,4);
  $("#activity-list").innerHTML = activity.map(a => `<div class="activity-item"><span class="activity-symbol">${a.symbol}</span><div><b>${safeName(a.title)}</b><small>${safeName(a.subtitle)}</small></div><time>${a.time}</time></div>`).join("");
  $("#last-run").textContent = title + " completed";
  $(".status-text").textContent = "DONE";
}
function showResults(title, subtitle, content){
  $("#result-title").textContent = title;
  $("#result-subtitle").textContent = subtitle;
  $("#result-content").innerHTML = content;
  resultsPanel.classList.remove("hidden");
  $("#comparison-view").classList.add("hidden");
  resultsPanel.scrollIntoView({behavior:"smooth",block:"start"});
}
function stats(items){
  return `<div class="result-grid">${items.map(x=>`<div class="result-stat"><span>${safeName(x.label)}</span><b>${safeName(x.value)}</b><small>${safeName(x.note)}</small></div>`).join("")}</div>`;
}
function row(name,status,infected){
  return `<div class="result-row"><span>${safeName(name)}</span><span><i class="status-pill ${infected?"infected-pill":"clean-pill"}">${safeName(status)}</i></span></div>`;
}
function note(title, text){
  return `<div class="concept-note"><b>${safeName(title)}:</b> ${safeName(text)}</div>`;
}
function runVirus(){
  const files=["Document_A","Document_B","Document_C","Photo_A","Photo_B","Report_A","Report_B","Spreadsheet_A"];
  let infected=new Set(["Document_A"]), rounds=[];
  rounds.push(`Initial state: ${infected.size} of ${files.length} files infected.`);
  for(let r=1;r<=3;r++){
    const fresh=[];
    files.forEach(f=>{if(!infected.has(f)&&rand(.45))fresh.push(f)});
    fresh.forEach(f=>infected.add(f));
    rounds.push(`Round ${r}: ${fresh.length ? fresh.join(", ") : "No new simulated infections."}`);
  }
  const body=files.map(f=>row(f,infected.has(f)?"SIMULATED INFECTED":"CLEAN",infected.has(f))).join("");
  showResults("Virus simulation","Fictional files · Three replication rounds",
    stats([{label:"Total files",value:files.length,note:"Fictional objects"},{label:"Infected",value:infected.size,note:"Simulated only"},{label:"Clean",value:files.length-infected.size,note:"No real files touched"}])+
    `<div class="result-table"><div class="result-row head"><span>FILE OBJECT</span><span>SIMULATED STATUS</span></div>${body}</div>`+
    `<pre class="sim-log">${safeName(rounds.join("\n"))}</pre>`+
    note("Behavior demonstrated","A virus replicates by attaching its simulated behavior to other files or objects. The outcome varies each time because the demonstration uses random probabilities."));
  logActivity("Virus simulation","3 replication rounds completed","◉");
}
function runWorm(){
  const network={"PC-1":["PC-2","PC-3"],"PC-2":["PC-1","PC-4","PC-5"],"PC-3":["PC-1","PC-6"],"PC-4":["PC-2","PC-7"],"PC-5":["PC-2","PC-8"],"PC-6":["PC-3"],"PC-7":["PC-4"],"PC-8":["PC-5"]};
  let infected=new Set(["PC-1"]), rounds=["Initial state: PC-1 is the starting computer."];
  for(let r=1;r<=5;r++){
    const fresh=new Set();
    infected.forEach(pc=>network[pc].forEach(n=>{if(!infected.has(n)&&rand(.65))fresh.add(n)}));
    fresh.forEach(n=>infected.add(n));
    rounds.push(`Round ${r}: ${fresh.size ? [...fresh].sort().join(", ")+" reached" : "No new simulated computers reached."}`);
    if(infected.size===Object.keys(network).length){rounds.push("All simulated computers have been reached.");break;}
  }
  const body=Object.keys(network).map(pc=>row(pc,infected.has(pc)?"SIMULATED REACHED":"UNREACHED",infected.has(pc))).join("");
  showResults("Worm simulation","Virtual network · Up to five propagation rounds",
    stats([{label:"Virtual computers",value:Object.keys(network).length,note:"Fictional network nodes"},{label:"Reached",value:infected.size,note:"Simulated only"},{label:"Unreached",value:Object.keys(network).length-infected.size,note:"No network activity"}])+
    `<div class="result-table"><div class="result-row head"><span>COMPUTER NODE</span><span>SIMULATED STATUS</span></div>${body}</div>`+
    `<pre class="sim-log">${safeName(rounds.join("\n"))}</pre>`+
    note("Behavior demonstrated","A worm can spread between connected systems without requiring a user to manually copy it. These are virtual nodes only; no actual network is contacted."));
  logActivity("Worm simulation","Virtual network propagation completed","⌘");
}
function runTrojan(){
  const programs=[
    {name:"Free_Game.exe",appearance:"Game installer",trusted:true},
    {name:"Photo_Editor.exe",appearance:"Photo editing application",trusted:true},
    {name:"System_Update.exe",appearance:"System update",trusted:false}
  ];
  const target=programs[2];
  const body=programs.map(p=>`<div class="result-row"><span><b>${safeName(p.name)}</b><br><small style="color:#7f8ba3">${safeName(p.appearance)}</small></span><span><i class="status-pill ${p===target?"infected-pill":"clean-pill"}">${p===target?"SUSPICIOUS MOCK APP":"DEMO PROGRAM"}</i></span></div>`).join("");
  showResults("Trojan simulation","Mock programs · No program is executed",
    stats([{label:"Programs inspected",value:3,note:"Fictional entries"},{label:"Suspicious example",value:"1",note:"System_Update.exe"},{label:"Real system harm",value:"NONE",note:"No real execution"}])+
    `<div class="result-table"><div class="result-row head"><span>MOCK PROGRAM</span><span>DEMO CLASSIFICATION</span></div>${body}</div>`+
    `<pre class="sim-log">User sees: ${target.appearance}\nProgram: ${target.name}\n[SIMULATED] Suspicious behavior would be represented here.\n[SIMULATED] No actual program was launched.\nReal system changes: NONE</pre>`+
    note("Behavior demonstrated","A Trojan disguises itself as something legitimate and relies on a user running it. This website only displays a fictional example; it does not launch or inspect applications."));
  logActivity("Trojan simulation","Mock suspicious program inspected","⬡");
}
function runAll(){
  // Generate three independent results in one combined report.
  const files=["Document_A","Document_B","Document_C","Photo_A","Photo_B","Report_A","Report_B","Spreadsheet_A"];
  const virus=new Set(["Document_A"]); let virusLog=[];
  for(let r=1;r<=3;r++){const fresh=[];files.forEach(f=>{if(!virus.has(f)&&rand(.45))fresh.push(f)});fresh.forEach(f=>virus.add(f));virusLog.push(`Virus round ${r}: ${fresh.length} new file(s)`);}
  const net={"PC-1":["PC-2","PC-3"],"PC-2":["PC-1","PC-4","PC-5"],"PC-3":["PC-1","PC-6"],"PC-4":["PC-2","PC-7"],"PC-5":["PC-2","PC-8"],"PC-6":["PC-3"],"PC-7":["PC-4"],"PC-8":["PC-5"]};
  const reached=new Set(["PC-1"]);let wormLog=[];
  for(let r=1;r<=5;r++){const fresh=new Set();reached.forEach(pc=>net[pc].forEach(n=>{if(!reached.has(n)&&rand(.65))fresh.add(n)}));fresh.forEach(n=>reached.add(n));wormLog.push(`Worm round ${r}: ${fresh.size} new computer(s)`);if(reached.size===8)break;}
  showResults("All simulations","Combined report · Safe educational mode",
    `<div class="result-grid">
      <div class="result-stat"><span>Virus · infected files</span><b>${virus.size}/8</b><small>Three replication rounds</small></div>
      <div class="result-stat"><span>Worm · computers reached</span><b>${reached.size}/8</b><small>Virtual network only</small></div>
      <div class="result-stat"><span>Trojan · suspicious mock</span><b>1</b><small>No real program executed</small></div>
    </div>
    <div class="result-table"><div class="result-row head"><span>MODULE</span><span>SUMMARY</span></div>
    ${row("Virus",`${virus.size} of 8 files infected`,false)}
    ${row("Worm",`${reached.size} of 8 computers reached`,false)}
    ${row("Trojan","Suspicious mock app displayed",false)}</div>
    <pre class="sim-log">${safeName([...virusLog,...wormLog,"Trojan: suspicious program represented in the interface.","Safety: no real files or network accessed."].join("\n"))}</pre>
    ${note("Important","Randomized results may differ on every run. All files, computers, and programs are fictional objects held only in browser memory.")}`);
  logActivity("All simulations","Virus, worm, and Trojan demos completed","✓");
}
function showComparison(){
  $("#comparison-view").classList.remove("hidden");
  resultsPanel.classList.add("hidden");
  setActive("Compare Threats");
  $("#comparison-view").scrollIntoView({behavior:"smooth",block:"start"});
}
function showOverview(){
  $("#comparison-view").classList.add("hidden");resultsPanel.classList.add("hidden");setActive("Overview");
}
function runSim(type){
  $("#comparison-view").classList.add("hidden");
  const labels={virus:"Virus Simulation",worm:"Worm Simulation",trojan:"Trojan Simulation"};
  setActive(labels[type] || "Overview");
  ({virus:runVirus,worm:runWorm,trojan:runTrojan}[type]||showOverview)();
}
$$("[data-sim]").forEach(b=>b.addEventListener("click",()=>runSim(b.dataset.sim)));
$$("[data-view='overview']").forEach(b=>b.addEventListener("click",showOverview));
$$("[data-view='comparison']").forEach(b=>b.addEventListener("click",showComparison));
$("#run-all-top").addEventListener("click",runAll);
$("#close-results").addEventListener("click",()=>resultsPanel.classList.add("hidden"));
