/* 화면과 진행 */
"use strict";
const $=id=>document.getElementById(id);
const el=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v)}for(const c of kids)if(c!=null)e.append(c);return e};
const chip=elk=>el('span',{class:'chip',style:'background:'+EL[elk].c,text:EL[elk].n});
const fmtN=n=>Math.floor(n).toLocaleString('ko-KR');
const fmtDur=ms=>{const m=Math.floor(ms/60000),h=Math.floor(m/60);return h?h+'시간 '+(m%60)+'분':m+'분'};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};

/* ---------- 저장 ---------- */
const KEY='mongle_v1';
let S=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&v.mons)return v}catch(e){}return null}
const byUid=u=>S.mons.find(m=>m.uid===u);
const partyMons=()=>S.party.map(byUid).filter(Boolean);
const huntIdx=()=>Math.min(S.cleared,REG.length-1);
const nextBoss=()=>S.cleared<REG.length?REG[S.cleared]:null;

/* ---------- 방치 보상 ---------- */
function accrue(ms){
  const R=REG[huntIdx()],min=ms/60000,out={exp:Math.round(R.exp*min),gold:R.gold*min,events:[]};
  S.goldF=(S.goldF||0)+out.gold;const g=Math.floor(S.goldF);S.gold+=g;S.goldF-=g;
  S.xpF=(S.xpF||0)+R.exp*min;const x=Math.floor(S.xpF);S.xpF-=x;
  if(x>0)for(const m of S.mons){const share=S.party.includes(m.uid)?x:Math.floor(x/2);const before=m.lv;
    for(const e of giveXp(m,share)){S.dex[e.to]=true;out.events.push(SP[e.from].n+'이(가) '+SP[e.to].n+'(으)로 진화했다!')}
    if(m.lv>before&&S.party.includes(m.uid))out.events.push(SP[m.sp].n+' Lv '+before+' → '+m.lv)}
  return out;
}
let lastSec=Date.now();
function tick(){
  const now=Date.now();let dt=now-S.lastTick;if(dt<0)dt=0;
  S.lastTick=now;
  const r=accrue(Math.min(dt,OFFLINE_CAP));
  for(const t of r.events)if(t.includes('진화'))toast(t);
  if(r.events.length){renderTab()}
  updWallet();
  if(now-lastSec>15000){save();lastSec=now}
}

/* ---------- 상단 ---------- */
function updWallet(){$('gold').textContent=fmtN(S.gold);$('tix').textContent=S.tix;$('freeDot').hidden=S.lastFree===today();
  const R=REG[huntIdx()];$('stageLabel').textContent=R.n;$('rate').textContent='분당 EXP '+R.exp+' · 골드 '+R.gold}
let toastT=null;
function toast(t){const old=document.querySelector('.toast');if(old)old.remove();const d=el('div',{class:'toast',role:'status',text:t});document.body.append(d);clearTimeout(toastT);toastT=setTimeout(()=>d.remove(),2600)}

/* ---------- 배경 ---------- */
const BG=[
 {sky:['#7ec8ff','#d8f0ff'],far:'#a6d4f2',mid:'#5cc06a',ground:'#78d070',path:'#e8cf8a',deco:'flower'},
 {sky:['#62c0ff','#cdeeff'],far:'#3a8ad8',mid:'#5aa8f0',ground:'#f2dc9a',path:'#e6c880',deco:'wave'},
 {sky:['#ff8a5a','#ffd0a0'],far:'#a04a3a',mid:'#6a3a3a',ground:'#8a5a4a',path:'#5a3a32',deco:'lava'},
 {sky:['#2a2448','#4a3e78'],far:'#3a3264',mid:'#5a4c90',ground:'#4a4070',path:'#3a3260',deco:'crystal'},
 {sky:['#1a2050','#5a4aa0'],far:'#2a3070',mid:'#8a7ac8',ground:'#c8b890',path:'#b0a078',deco:'star'}
];
const W=192,H=112,GROUND=84;
function drawBg(c,i,off,t){const B=BG[i];
  const gr=c.createLinearGradient(0,0,0,GROUND);gr.addColorStop(0,B.sky[0]);gr.addColorStop(1,B.sky[1]);c.fillStyle=gr;c.fillRect(0,0,W,GROUND);
  if(B.deco==='star'||B.deco==='crystal'){c.fillStyle='#fff';for(let k=0;k<18;k++){const x=(k*53+7)%W,y=(k*29+5)%50;if((k+Math.floor(t/500))%5)c.fillRect(x,y,1,1)}}
  if(B.deco!=='crystal'){c.fillStyle='#ffffffcc';for(let k=0;k<3;k++){const x=((k*80-off*.05)%260+260)%260-40;c.fillRect(x,12+k*9,22,4);c.fillRect(x+4,9+k*9,12,3)}}
  c.fillStyle=B.far;for(let x=0;x<W;x+=2){const X=x+off*.12;const h=B.deco==='wave'?14:16+Math.sin(X*.04)*8+Math.sin(X*.013)*8;c.fillRect(x,GROUND-h-8,2,h+8)}
  c.fillStyle=B.mid;for(let x=0;x<W;x+=2){const X=x+off*.35;const h=B.deco==='wave'?4+Math.sin(X*.2+t/300)*2:6+Math.abs(Math.sin(X*.08))*10;c.fillRect(x,GROUND-h,2,h)}
  c.fillStyle=B.ground;c.fillRect(0,GROUND,W,H-GROUND);
  c.fillStyle=B.path;c.fillRect(0,GROUND+12,W,10);
  c.fillStyle='#0002';for(let x=-(off%14);x<W;x+=14){c.fillRect(x,GROUND+5,4,1);c.fillRect(x+8,GROUND+25,3,1)}
  if(B.deco==='flower'){for(let x=-(off*.9%23);x<W;x+=23){c.fillStyle='#ff9ac0';c.fillRect(x+5,GROUND+3,2,2);c.fillStyle='#fff6a0';c.fillRect(x+15,GROUND+8,2,2)}}
  if(B.deco==='lava'){c.fillStyle='#ff6a2a';for(let x=-(off%31);x<W;x+=31)c.fillRect(x+4,GROUND+7,7,2)}
  if(B.deco==='crystal'){for(let x=-(off*.35%40);x<W;x+=40){c.fillStyle='#a8e4ff';c.fillRect(x+8,GROUND-9,3,9);c.fillRect(x+12,GROUND-5,2,5);c.fillStyle='#e0a8ff';c.fillRect(x+26,GROUND-7,3,7)}}
}
function drawPops(c,pops,dt){c.font='bold 9px sans-serif';c.textAlign='center';
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.t-=dt;if(p.t<=0){pops.splice(i,1);continue}
    const y=p.y-(1000-p.t)*.02;c.fillStyle='#1e1a2e';c.fillText(p.s,p.x+1,y+1);c.fillStyle=p.c;c.fillText(p.s,p.x,y)}
  c.textAlign='start'}

/* ---------- 사냥 무대 ---------- */
const st=$('stage').getContext('2d');st.imageSmoothingEnabled=false;
const hunt={off:0,mob:null,t:0,pops:[],atk:-1};
const PX=[88,120,152];
function huntFrame(now,dt){
  const ti=huntIdx(),R=REG[ti];
  hunt.t+=dt;const cyc=hunt.t%4200;
  if(!hunt.mob||cyc<dt){hunt.mob={id:R.mobs[Math.floor(Math.random()*R.mobs.length)],hit:false,gone:false}}
  const fighting=cyc>1400;
  if(!fighting)hunt.off+=dt*.03;
  drawBg(st,ti,hunt.off,now);
  // 야생 몬스터
  const m=hunt.mob;
  if(m&&!m.gone){const x=cyc<1400?-40+cyc/1400*58:18;
    let mode='n';if(cyc>2400&&cyc<3000&&Math.floor(now/70)%2)mode='f';
    const alpha=cyc>3000?Math.max(0,1-(cyc-3000)/400):1;
    const im=SPR[m.id].n;drawSpr(st,m.id,x,GROUND-im.height*2+4,{sc:2,mode,alpha});
    if(cyc>3000&&!m.hit){m.hit=true;hunt.pops.push({x:x+16,y:GROUND-30,s:'+'+Math.round(R.gold*4.2/60*10)/10+'G',c:'#ffd84a',t:1000})}
  }
  // 우리 파티
  const P=partyMons();
  P.forEach((pm,i)=>{const im=SPR[pm.sp].n,bob=fighting?0:Math.floor((now/250+i)%2);
    const lunge=(cyc>1500+i*300&&cyc<1700+i*300)?-6:0;
    drawSpr(st,pm.sp,PX[i]+lunge,GROUND-im.height*2+4-bob,{sc:2})});
  if(!P.length){st.fillStyle='#1e1a2ecc';st.fillRect(0,40,W,24);st.fillStyle='#fff';st.font='10px sans-serif';st.textAlign='center';st.fillText('편성 탭에서 몬스터를 출전시켜 주세요',W/2,55);st.textAlign='start'}
  drawPops(st,hunt.pops,dt);
}

/* ---------- 탭 ---------- */
let tab='home',dexSel=null,lastPull=[];
const main=$('main');
function setTab(t){tab=t;document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===t?'page':'false'));renderTab();window.scrollTo(0,0)}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
function renderTab(){main.textContent='';({home:renderHome,team:renderTeam,gacha:renderGacha,dex:renderDex})[tab]()}

function advice(bossEl){
  const good=Object.keys(EL).filter(e=>emult(e,bossEl)>1).map(e=>EL[e].n);
  const bad=Object.keys(EL).filter(e=>emult(e,bossEl)<1).map(e=>EL[e].n);
  const takeHurt=Object.keys(EL).filter(e=>emult(bossEl,e)>1).map(e=>EL[e].n);
  const p=el('div',{class:'adv'});
  if(good.length)p.append(el('div',{},'유리: ',el('span',{class:'g',text:good.join('·')+' 속성으로 공격'})));
  if(bad.length)p.append(el('div',{},'불리: ',el('span',{class:'b',text:bad.join('·')+' 속성 공격은 약하게 들어감'})));
  if(takeHurt.length)p.append(el('div',{},'주의: ',el('span',{class:'b',text:takeHurt.join('·')+' 속성은 아프게 맞음'})));
  return p;
}
function monSlot(m){
  if(!m)return el('div',{class:'slot'},el('span',{class:'muted',text:'빈 자리'}));
  const b=SP[m.sp],pct=m.lv>=MAXLV?100:m.xp/need(m.lv)*100;
  const bar=el('div',{class:'bar'},el('i',{style:'width:'+pct+'%'}));
  return el('div',{class:'slot on'},thumb(m.sp),el('span',{class:'nm',text:b.n}),el('span',{},chip(b.el),' ',el('span',{class:'muted',text:'Lv '+m.lv})),bar);
}
function renderHome(){
  const nb=nextBoss();
  if(nb){const b=nb.boss,c=el('div',{class:'card'});
    c.append(el('div',{class:'row between'},el('h2',{text:'지역 '+(S.cleared+1)+' 보스'}),el('span',{class:'muted',text:'권장 Lv '+b.lv})));
    const info=el('div',{});info.append(el('div',{style:'font-family:var(--display);font-size:20px'},b.n+' ',chip(b.el)),advice(b.el));
    c.append(el('div',{class:'bossBox'},thumb(b.id,'n',3),info));
    const btn=el('button',{class:'btn wide',style:'margin-top:10px',text:'보스에게 도전',onclick:startBattle});
    if(!partyMons().length)btn.disabled=true;
    c.append(btn);main.append(c);
  }else main.append(el('div',{class:'card'},el('h2',{text:'모든 보스를 물리쳤어요!'}),el('p',{class:'muted',text:'다음 지역은 업데이트를 기다려 주세요. 도감을 채우며 계속 키울 수 있습니다.'})));
  const pc=el('div',{class:'card'});
  const avg=partyMons().length?Math.round(partyMons().reduce((a,m)=>a+m.lv,0)/partyMons().length):0;
  pc.append(el('div',{class:'row between'},el('h2',{text:'출전 파티'}),el('span',{class:'muted',text:'평균 Lv '+avg})));
  const pr=el('div',{class:'party'});for(let i=0;i<3;i++)pr.append(monSlot(byUid(S.party[i])));
  pc.append(pr,el('p',{class:'info'},'창을 닫아도 최대 24시간까지 사냥합니다. 출전한 몬스터는 경험치를 모두, 나머지는 절반을 받습니다.'));
  main.append(pc);
}
function renderTeam(){
  const nb=nextBoss();
  const c=el('div',{class:'card'});c.append(el('h2',{text:'출전 파티 (3마리)'}));
  const pr=el('div',{class:'party'});for(let i=0;i<3;i++)pr.append(monSlot(byUid(S.party[i])));c.append(pr);
  if(nb)c.append(el('div',{style:'margin-top:10px'},el('div',{class:'muted'},'다음 상대: '+nb.boss.n+' ',chip(nb.boss.el)),advice(nb.boss.el)));
  main.append(c);
  const lc=el('div',{class:'card'});lc.append(el('div',{class:'row between'},el('h2',{text:'보유 몬스터'}),el('span',{class:'muted',text:'눌러서 출전 / 해제'})));
  const list=el('div',{class:'list'});
  const sorted=[...S.mons].sort((a,b)=>(S.party.includes(b.uid)-S.party.includes(a.uid))||b.lv-a.lv);
  for(const m of sorted){const b=SP[m.sp],inP=S.party.includes(m.uid);
    const card=el('button',{class:'mon r'+b.r+(inP?' inparty':''),'aria-pressed':String(inP)},thumb(m.sp),el('span',{class:'nm',text:b.n}),el('span',{},chip(b.el)),el('span',{class:'lv',text:'Lv '+m.lv+' · '+RARITY[b.r].n}));
    card.addEventListener('click',()=>{
      if(inP){S.party=S.party.filter(u=>u!==m.uid)}
      else if(S.party.length>=3){toast('파티가 가득 찼어요. 먼저 한 마리를 빼주세요.');return}
      else S.party.push(m.uid);
      save();renderTab()});
    list.append(card)}
  lc.append(list);main.append(lc);
}
function renderGacha(){
  const c=el('div',{class:'card'});
  c.append(el('h2',{text:'동료 뽑기'}),el('p',{class:'muted',style:'margin:0 0 10px'},'전설 5% · 희귀 25% · 일반 70%. 이미 있는 몬스터가 나오면 그 몬스터의 경험치로 바뀝니다.'));
  const free=S.lastFree!==today();
  const g=el('div',{class:'gacha'});
  g.append(
    el('button',{class:'btn',onclick:()=>doPull(1,'free')},'오늘의 무료 1회',el('small',{text:free?'받을 수 있어요':'내일 다시'})),
    el('button',{class:'btn blue',onclick:()=>doPull(1,'tix')},'뽑기권 1회',el('small',{text:'◆ '+S.tix+'장 보유'})),
    el('button',{class:'btn white',onclick:()=>doPull(1,'gold')},'1회',el('small',{text:'● '+fmtN(PULL_COST)})),
    el('button',{class:'btn white',onclick:()=>doPull(10,'gold')},'10회',el('small',{text:'● '+fmtN(PULL10_COST)}))
  );
  const bs=g.querySelectorAll('button');bs[0].disabled=!free;bs[1].disabled=S.tix<1;bs[2].disabled=S.gold<PULL_COST;bs[3].disabled=S.gold<PULL10_COST;
  c.append(g);
  if(lastPull.length){const r=el('div',{class:'results'});lastPull.forEach((p,i)=>{const b=SP[p.sp];
    const d=el('div',{class:'res r'+b.r,style:'animation-delay:'+(i*.08)+'s'},thumb(p.sp,'n',2),el('div',{class:'nm',text:b.n}),el('div',{class:'tag',text:p.dup?'경험치로':'NEW!'}));r.append(d)});c.append(r)}
  main.append(c);
}
function renderDex(){
  const c=el('div',{class:'card'});const got=DEX.filter(k=>S.dex[k]).length;
  c.append(el('div',{class:'row between'},el('h2',{text:'몬스터 도감'}),el('span',{class:'muted',text:got+' / '+DEX.length})));
  const g=el('div',{class:'dex'});
  DEX.forEach((k,i)=>{const own=S.dex[k];const b=el('button',{class:'dexi','aria-label':own?SP[k].n:'미발견'},el('div',{class:'no',text:'No.'+String(i+1).padStart(2,'0')}),thumb(k,own?'n':'s',2),el('div',{class:'nm',text:own?SP[k].n:'???'}));
    b.addEventListener('click',()=>{dexSel=k;renderTab()});g.append(b)});
  c.append(g);
  if(dexSel){const b=SP[dexSel],own=S.dex[dexSel];
    c.append(el('div',{class:'info'},own?el('div',{},el('b',{text:b.n+' '}),chip(b.el),' ',el('span',{class:'muted',text:RARITY[b.r].n})):el('b',{text:'아직 만나지 못한 몬스터'}),
      el('div',{text:own?b.d+' 기술: '+b.sk.n:'뽑기나 진화로 만날 수 있습니다.'})))}
  main.append(c);
}

/* ---------- 뽑기 ---------- */
function newMon(sp){const avg=partyMons().length?partyMons().reduce((a,m)=>a+m.lv,0)/partyMons().length:1;
  const m={uid:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),sp,lv:1,xp:0};
  const target=Math.max(1,Math.round(avg*.6));let x=0;for(let l=1;l<target;l++)x+=need(l);for(const e of giveXp(m,x))S.dex[e.to]=true;return m}
function doPull(n,kind){
  if(kind==='free'){if(S.lastFree===today())return;S.lastFree=today()}
  else if(kind==='tix'){if(S.tix<1)return;S.tix--}
  else{const cost=n===10?PULL10_COST:PULL_COST;if(S.gold<cost)return;S.gold-=cost}
  lastPull=[];
  for(let i=0;i<n;i++){const sp=pull();
    const owned=S.mons.find(m=>m.sp===sp||(SP[sp].evo&&m.sp===SP[sp].evo[0]));
    if(owned){for(const e of giveXp(owned,need(owned.lv)))S.dex[e.to]=true;lastPull.push({sp,dup:true})}
    else{const m=newMon(sp);S.mons.push(m);S.dex[sp]=true;S.dex[m.sp]=true;lastPull.push({sp,dup:false});if(S.party.length<3)S.party.push(m.uid)}}
  const best=Math.max(...lastPull.map(p=>SP[p.sp].r));
  if(best===3)toast('전설 몬스터가 나타났다!');
  save();updWallet();renderTab();
}

/* ---------- 보스전 ---------- */
const bc=$('bstage').getContext('2d');bc.imageSmoothingEnabled=false;
const BP=[{x:146,y:12},{x:112,y:30},{x:146,y:50}];
let B=null;
function startBattle(){
  const nb=nextBoss();if(!nb||!partyMons().length)return;
  const team=partyMons();const res=battle(team,nb.boss);
  B={reg:nb,boss:nb.boss,team:team.map(m=>({sp:m.sp,mhp:stats(m).hp})),res,i:0,php:team.map(m=>stats(m).hp),bhp:bossStats(nb.boss).hp,bmhp:bossStats(nb.boss).hp,
    fx:{boss:0,p:[0,0,0],lb:0,lp:[0,0,0]},pops:[],faint:[false,false,false],done:false,timer:0};
  $('bTitle').textContent=nb.n+' — '+nb.boss.n;$('blog').textContent='';$('bResult').hidden=true;$('bSkip').hidden=false;
  $('battleOv').hidden=false;B.timer=setInterval(stepBattle,850);stepBattle();
}
function logLine(s,cls){const p=el('p',{text:s});if(cls)p.className=cls;$('blog').append(p);$('blog').scrollTop=$('blog').scrollHeight}
function stepBattle(){
  if(!B||B.done)return;
  const e=B.res.ev[B.i++];if(!e){finishBattle();return}
  B.php=e.php;B.bhp=e.bhp;
  const cls=e.t==='win'?'win':e.t==='lose'?'lose':(e.em>1||e.t==='rage')?'em':'';
  logLine(e.s,cls);
  if(e.t==='hit'){B.fx.boss=350;B.fx.lp[e.who]=220;B.pops.push({x:40,y:40,s:String(e.dmg),c:e.em>1?'#ffd84a':'#fff',t:1000})}
  if(e.t==='bhit'){B.fx.lb=250;for(const t of e.tg){B.fx.p[t.i]=350;B.pops.push({x:BP[t.i].x+16,y:BP[t.i].y+6,s:String(t.d),c:'#ff8a8a',t:1000})}}
  if(e.t==='heal'){for(const i of e.tg)B.pops.push({x:BP[i].x+16,y:BP[i].y+6,s:'회복',c:'#7aff9a',t:1000})}
  if(e.t==='faint')B.faint[e.who]=true;
  if(e.t==='win'||e.t==='lose')finishBattle();
}
function finishBattle(){
  if(B.done)return;B.done=true;clearInterval(B.timer);
  const last=B.res.ev[B.res.ev.length-1];B.php=last.php;B.bhp=last.bhp;
  if(B.i<B.res.ev.length){logLine('…','');logLine(last.s,B.res.win?'win':'lose');B.i=B.res.ev.length}
  $('bSkip').hidden=true;const box=$('bResult');box.textContent='';box.hidden=false;
  if(B.res.win){
    const idx=REG.indexOf(B.reg),rw={gold:500*(idx+1),tix:3};
    S.gold+=rw.gold;S.tix+=rw.tix;S.cleared=Math.max(S.cleared,idx+1);save();updWallet();
    box.append(el('div',{class:'info'},el('b',{text:'승리! '}),'보상: 골드 '+fmtN(rw.gold)+', 뽑기권 '+rw.tix+'장',
      el('div',{text:S.cleared<REG.length?'새 지역 「'+REG[S.cleared].n+'」이(가) 열렸다! 이제 그곳에서 사냥합니다.':'모든 지역을 정복했다!'})));
  }else{
    const good=Object.keys(EL).filter(e=>emult(e,B.boss.el)>1).map(e=>EL[e].n);
    box.append(el('div',{class:'info'},el('b',{text:'패배… '}),'잠시 사냥으로 키운 뒤 다시 도전해 보세요.'+(good.length?' 이 보스에게는 '+good.join('·')+' 속성이 잘 통합니다.':'')));
  }
  box.append(el('button',{class:'btn wide',style:'margin-top:10px',text:'돌아가기',onclick:()=>{$('battleOv').hidden=true;B=null;renderTab()}}));
}
$('bSkip').addEventListener('click',finishBattle);
function battleFrame(now,dt){
  if(!B)return;const ri=REG.indexOf(B.reg);drawBg(bc,ri,0,now);
  const im=SPR[B.boss.id].n,bs=3,bw=im.width*bs,bh=im.height*bs;
  const bx=8+(B.fx.lb>0?6:0)+(B.fx.boss>0?(Math.floor(now/40)%2?2:-2):0);
  const bAlive=B.bhp>0||!B.done;
  drawSpr(bc,B.boss.id,bx,GROUND-bh+6,{sc:bs,mode:B.fx.boss>0&&Math.floor(now/70)%2?'f':'n',alpha:B.done&&B.res.win?.25:1});
  bc.fillStyle='#1e1a2ecc';bc.fillRect(6,6,62,7);bc.fillStyle='#ff5a6a';bc.fillRect(7,7,60*Math.max(0,B.bhp)/B.bmhp,5);
  B.team.forEach((t,i)=>{const p=BP[i],pim=SPR[t.sp].n;
    const x=p.x+(B.fx.lp[i]>0?-8:0),mode=B.fx.p[i]>0&&Math.floor(now/70)%2?'f':'n';
    drawSpr(bc,t.sp,x,p.y,{sc:2,mode,alpha:B.faint[i]?.3:1});
    bc.fillStyle='#1e1a2ecc';bc.fillRect(p.x+2,p.y+pim.height*2+1,32,4);bc.fillStyle='#5ee07a';bc.fillRect(p.x+3,p.y+pim.height*2+2,30*Math.max(0,B.php[i])/t.mhp,2)});
  for(const k of['boss','lb'])B.fx[k]=Math.max(0,B.fx[k]-dt);
  for(let i=0;i<3;i++){B.fx.p[i]=Math.max(0,B.fx.p[i]-dt);B.fx.lp[i]=Math.max(0,B.fx.lp[i]-dt)}
  drawPops(bc,B.pops,dt);
}

/* ---------- 루프 ---------- */
let lt=performance.now();
function frame(now){const dt=Math.min(100,now-lt);lt=now;if(S)huntFrame(now,dt);battleFrame(now,dt);requestAnimationFrame(frame)}

/* ---------- 시작 ---------- */
function begin(){
  S=load();
  if(!S){
    $('startOv').hidden=false;const box=$('starters');
    for(const sp of POOL[1]){const b=SP[sp];
      box.append(el('button',{class:'mon',onclick:()=>{
        S={mons:[],party:[],gold:600,tix:1,cleared:0,lastTick:Date.now(),lastFree:'',dex:{},xpF:0,goldF:0};
        const m=newMon(sp);S.mons.push(m);S.party.push(m.uid);S.dex[sp]=true;save();
        $('startOv').hidden=true;updWallet();renderTab();
        toast(b.n+'와(과) 원정을 떠납니다! 뽑기 탭에서 동료를 더 모아보세요.')}},
        thumb(sp,'n',3),el('span',{class:'nm',text:b.n}),el('span',{},chip(b.el)),el('span',{class:'lv',text:b.d})))}
  }else{
    const away=Date.now()-S.lastTick;
    if(away>60000){
      const gold0=S.gold,ms=Math.min(away,OFFLINE_CAP);
      const lv0=Object.fromEntries(S.mons.map(m=>[m.uid,m.lv]));
      S.lastTick=Date.now();const r=accrue(ms);
      $('awayText').textContent=fmtDur(ms)+' 동안 '+REG[huntIdx()].n+'에서 사냥했어요. 골드 +'+fmtN(S.gold-gold0)+(away>OFFLINE_CAP?' (최대 24시간까지만 쌓여요)':'');
      const ul=$('awayLog');ul.textContent='';
      for(const t of r.events)ul.append(el('li',{text:t}));
      if(!r.events.length)ul.append(el('li',{text:'레벨 변화는 없었어요.'}));
      $('awayOv').hidden=false;save();
    }
    updWallet();renderTab();
  }
  setInterval(()=>{if(S)tick()},1000);
  requestAnimationFrame(frame);
}
$('awayOk').addEventListener('click',()=>{$('awayOv').hidden=true});
document.addEventListener('visibilitychange',()=>{if(S)save()});
initSprites();begin();
