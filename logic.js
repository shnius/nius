/* 게임 규칙 — 화면과 무관한 순수 계산부 (Node에서도 시험 가능) */
"use strict";
const EL={
  fire:{n:'불',c:'#ff7a3a'},water:{n:'물',c:'#3a9aff'},grass:{n:'풀',c:'#3cb85a'},
  light:{n:'빛',c:'#e8b820'},dark:{n:'어둠',c:'#9a5ae0'}
};
function emult(a,d){
  const beats={fire:'grass',grass:'water',water:'fire'};
  if(beats[a]===d)return 1.5;
  if(beats[d]===a)return .67;
  if((a==='light'&&d==='dark')||(a==='dark'&&d==='light'))return 1.5;
  return 1;
}
const RARITY={1:{n:'일반',c:'#9aa4b8'},2:{n:'희귀',c:'#4a9aff'},3:{n:'전설',c:'#f0b020'}};
// t: atk=강한 공격, crit=반드시 치명타, heal1=가장 다친 아군 회복, healall=전체 회복, shield=받는 피해 감소, atkheal=공격+전체 소량 회복
const SP={
 hwado:{n:'불씨도롱',el:'fire',r:1,hp:40,atk:13,def:8,spd:11,sk:{n:'불꽃튀기기',t:'atk',p:1.8,cd:3},evo:['hwado2',12],
   d:'꼬리 끝 불씨가 꺼지지 않게 늘 바쁘게 움직인다.'},
 hwado2:{n:'화염도롱',el:'fire',r:1,hp:52,atk:18,def:10,spd:12,sk:{n:'화염포',t:'atk',p:2.2,cd:3},
   d:'뿔이 달아오르면 주변 공기가 일렁인다.'},
 mul:{n:'물방울챙',el:'water',r:1,hp:46,atk:11,def:10,spd:9,sk:{n:'물대포',t:'atk',p:1.8,cd:3},evo:['mul2',12],
   d:'비 오는 날이면 몸이 한 뼘 커진다.'},
 mul2:{n:'파도챙',el:'water',r:1,hp:60,atk:15,def:13,spd:10,sk:{n:'해일',t:'atk',p:2.2,cd:3},
   d:'머리의 물마루로 작은 파도를 일으킨다.'},
 kong:{n:'새싹콩',el:'grass',r:1,hp:48,atk:10,def:10,spd:8,sk:{n:'광합성',t:'heal1',p:.35,cd:3},evo:['kong2',12],
   d:'햇볕을 쬐면 졸다가도 기운이 난다.'},
 kong2:{n:'넝쿨콩',el:'grass',r:1,hp:62,atk:14,def:13,spd:9,sk:{n:'생명의 씨앗',t:'healall',p:.22,cd:3},
   d:'머리의 꽃에서 동료를 낫게 하는 씨앗이 떨어진다.'},
 tokki:{n:'반짝토끼',el:'light',r:2,hp:40,atk:14,def:8,spd:14,sk:{n:'반짝빔',t:'atk',p:1.9,cd:3},evo:['tokki2',15],
   d:'귀를 쫑긋 세우면 빛이 모인다.'},
 tokki2:{n:'광휘토끼',el:'light',r:2,hp:52,atk:19,def:10,spd:15,sk:{n:'성광',t:'atk',p:2.4,cd:3},
   d:'머리 위 빛고리는 밤에도 꺼지지 않는다.'},
 nyang:{n:'그림자냥',el:'dark',r:2,hp:38,atk:15,def:7,spd:15,sk:{n:'그림자발톱',t:'crit',p:1.3,cd:3},evo:['nyang2',15],
   d:'그림자 속에 숨어 있다가 발톱을 휘두른다.'},
 nyang2:{n:'칠흑냥',el:'dark',r:2,hp:48,atk:20,def:9,spd:16,sk:{n:'칠흑참',t:'crit',p:1.6,cd:3},
   d:'붉은 눈이 보였다면 이미 늦었다.'},
 dudu:{n:'용암두더지',el:'fire',r:2,hp:58,atk:15,def:14,spd:7,sk:{n:'땅울림',t:'atk',p:2,cd:3},
   d:'땅속 용암길을 파고 다녀 등이 늘 따끈하다.'},
 turtle:{n:'숲거북',el:'grass',r:2,hp:72,atk:10,def:18,spd:5,sk:{n:'껍질막기',t:'shield',p:.35,cd:4},
   d:'등딱지에 이끼 정원을 키운다.'},
 lion:{n:'태양사자',el:'light',r:3,hp:72,atk:23,def:14,spd:14,sk:{n:'태양포효',t:'atk',p:2.6,cd:3},
   d:'갈기가 해처럼 타오르는 초원의 왕.'},
 whale:{n:'심해고래',el:'water',r:3,hp:92,atk:18,def:16,spd:9,sk:{n:'대해일',t:'atkheal',p:2.3,cd:3},
   d:'노래 한 소절에 바다가 잔잔해진다.'},
 tree:{n:'고목정령',el:'grass',r:3,hp:86,atk:16,def:16,spd:8,sk:{n:'대지의 축복',t:'healall',p:.3,cd:3},
   d:'천 년을 산 나무에 깃든 숲의 수호자.'}
};
const DEX=['hwado','hwado2','mul','mul2','kong','kong2','tokki','tokki2','nyang','nyang2','dudu','turtle','lion','whale','tree'];
const POOL={1:['hwado','mul','kong'],2:['tokki','nyang','dudu','turtle'],3:['lion','whale','tree']};
const PULL_RATE=[[3,.05],[2,.25],[1,.70]];
const PULL_COST=300,PULL10_COST=2700;

const REG=[
 {n:'봄바람 초원',exp:20,gold:10,mobs:['kong','hwado','mul'],
  boss:{id:'b1',n:'대왕두꺼비',el:'grass',lv:6,hm:.65,am:.75,spd:6,s1:'혀 휘두르기',s2:'독안개'}},
 {n:'반짝 해변',exp:50,gold:20,mobs:['mul','kong','turtle'],
  boss:{id:'b2',n:'집게대장',el:'water',lv:12,hm:.8,am:.85,spd:8,s1:'집게 조이기',s2:'거품 폭풍'}},
 {n:'붉은 화산',exp:110,gold:35,mobs:['hwado','dudu','mul'],
  boss:{id:'b3',n:'용암골렘',el:'fire',lv:20,spd:5,s1:'용암 주먹',s2:'분화'}},
 {n:'수정 동굴',exp:200,gold:55,mobs:['nyang','dudu','turtle'],
  boss:{id:'b4',n:'박쥐대왕',el:'dark',lv:30,spd:14,s1:'흡혈',s2:'초음파'}},
 {n:'별의 신전',exp:330,gold:80,mobs:['tokki','nyang','tree'],
  boss:{id:'b5',n:'천공룡',el:'light',lv:42,hm:.9,spd:12,s1:'빛의 꼬리',s2:'유성우'}}
];
const BOSSK={hp:9,atk:1.55,def:1.0};
function bossStats(b){const k=1+.1*(b.lv-1);return Object.assign({},b,{hp:Math.round(BOSSK.hp*50*k*(b.hm||1)),atk:Math.round(BOSSK.atk*14*k*(b.am||1)),def:Math.round(BOSSK.def*12*k)})}
const MAXLV=50,OFFLINE_CAP=24*3600e3;
const need=lv=>Math.round(10*Math.pow(lv,1.5));
function stats(m){const b=SP[m.sp],k=1+.1*(m.lv-1);
  return{hp:Math.round(b.hp*k),atk:Math.round(b.atk*k),def:Math.round(b.def*k),spd:b.spd};}

/* 경험치 지급 → 레벨업·진화 정보 반환 */
function giveXp(m,x){
  const out=[];if(m.lv>=MAXLV)return out;
  m.xp+=x;
  while(m.lv<MAXLV&&m.xp>=need(m.lv)){m.xp-=need(m.lv);m.lv++;
    const e=SP[m.sp].evo;
    if(e&&m.lv>=e[1]){out.push({t:'evo',from:m.sp,to:e[0]});m.sp=e[0]}}
  if(m.lv>=MAXLV)m.xp=0;
  return out;
}

/* ---------- 자동 전투 ---------- */
function battle(team,boss,rand=Math.random){
  const P=team.map(m=>{const s=stats(m);return{m,sp:SP[m.sp],n:SP[m.sp].n,el:SP[m.sp].el,hp:s.hp,mhp:s.hp,atk:s.atk,def:s.def,spd:s.spd,cd:SP[m.sp].sk.cd}});
  boss=bossStats(boss);
  const B={n:boss.n,el:boss.el,hp:boss.hp,mhp:boss.hp,atk:boss.atk,def:boss.def,spd:boss.spd,turn:0,rage:false};
  const ev=[];let shield=0;
  const snap=()=>({php:P.map(p=>Math.max(0,p.hp)),bhp:Math.max(0,B.hp)});
  const push=(o)=>{ev.push(Object.assign(o,snap()))};
  const dmgOf=(atk,pow,def,em,crit)=>Math.max(1,Math.round(pow*atk*40/(40+def)*em*(crit?1.6:1)*(.9+rand()*.2)));
  const emText=em=>em>1?' 효과가 굉장했다!':em<1?' 효과가 별로인 듯하다…':'';
  push({t:'text',s:boss.n+'이(가) 앞을 가로막았다!'});
  for(let round=1;round<=30;round++){
    const order=[...P.filter(p=>p.hp>0).map(p=>({k:'p',p,s:p.spd+rand()*3})),{k:'b',s:B.spd+rand()*3}].sort((a,b)=>b.s-a.s);
    for(const o of order){
      if(B.hp<=0||P.every(p=>p.hp<=0))break;
      if(o.k==='p'){const p=o.p;if(p.hp<=0)continue;const i=P.indexOf(p);p.cd--;
        const sk=p.sp.sk;
        if(p.cd<=0){
          const lowest=P.filter(q=>q.hp>0).sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0];
          if(sk.t==='heal1'&&lowest.hp<lowest.mhp*.85){p.cd=sk.cd;const h=Math.round(lowest.mhp*sk.p);lowest.hp=Math.min(lowest.mhp,lowest.hp+h);
            push({t:'heal',who:i,tg:[P.indexOf(lowest)],amt:h,s:p.n+'의 '+sk.n+'! '+lowest.n+'의 HP가 '+h+' 회복되었다.'});continue}
          if(sk.t==='healall'&&P.some(q=>q.hp>0&&q.hp<q.mhp*.8)){p.cd=sk.cd;const tg=[];
            for(const q of P)if(q.hp>0){q.hp=Math.min(q.mhp,q.hp+Math.round(q.mhp*sk.p));tg.push(P.indexOf(q))}
            push({t:'heal',who:i,tg,s:p.n+'의 '+sk.n+'! 동료 모두의 상처가 아물었다.'});continue}
          if(sk.t==='shield'){p.cd=sk.cd;shield=2;push({t:'buff',who:i,s:p.n+'의 '+sk.n+'! 동료가 받는 피해가 줄어든다.'});continue}
          if(sk.t==='atk'||sk.t==='crit'||sk.t==='atkheal'){p.cd=sk.cd;const em=emult(p.el,B.el),crit=sk.t==='crit'||rand()<.05;
            const d=dmgOf(p.atk,sk.p,B.def,em,crit);B.hp-=d;
            let s=p.n+'의 '+sk.n+'!'+(crit?' 급소에 맞았다!':'')+emText(em)+' '+d+' 피해.';
            if(sk.t==='atkheal'){for(const q of P)if(q.hp>0)q.hp=Math.min(q.mhp,q.hp+Math.round(q.mhp*.12));s+=' 동료들의 HP도 조금 회복되었다.'}
            push({t:'hit',who:i,skill:true,dmg:d,em,crit,s});continue}
        }
        const em=emult(p.el,B.el),crit=rand()<.05,d=dmgOf(p.atk,1,B.def,em,crit);B.hp-=d;
        push({t:'hit',who:i,skill:false,dmg:d,em,crit,s:p.n+'의 공격.'+(crit?' 급소에 맞았다!':'')+(em!==1?emText(em):'')+' '+d+' 피해.'});
      }else{
        B.turn++;
        if(!B.rage&&B.hp<B.mhp*.3){B.rage=true;B.atk=Math.round(B.atk*1.25);push({t:'rage',s:B.n+'이(가) 분노했다! 공격력이 올라간다.'})}
        const red=shield>0?.65:1;if(shield>0)shield--;
        const alive=P.filter(p=>p.hp>0);
        if(B.turn%3===0){const tg=[];let s=B.n+'의 '+boss.s2+'!';
          for(const q of alive){const em=emult(B.el,q.el),d=Math.round(dmgOf(B.atk,.7,q.def,em,false)*red);q.hp-=d;tg.push({i:P.indexOf(q),d})}
          s+=' 모두가 피해를 입었다.';push({t:'bhit',tg,aoe:true,s})}
        else{const q=alive[Math.floor(rand()*alive.length)],em=emult(B.el,q.el),crit=rand()<.05,d=Math.round(dmgOf(B.atk,1,q.def,em,crit)*red);q.hp-=d;
          push({t:'bhit',tg:[{i:P.indexOf(q),d}],s:B.n+'의 '+boss.s1+'! '+q.n+'에게 '+d+' 피해.'+emText(em)})}
        for(const q of alive)if(q.hp<=0)push({t:'faint',who:P.indexOf(q),s:q.n+'은(는) 쓰러졌다…'});
      }
    }
    if(B.hp<=0){push({t:'win',s:boss.n+'을(를) 쓰러뜨렸다!'});return{win:true,ev}}
    if(P.every(p=>p.hp<=0)){push({t:'lose',s:'파티가 모두 쓰러졌다…'});return{win:false,ev}}
  }
  push({t:'lose',s:'시간이 너무 흘렀다. '+boss.n+'이(가) 둥지로 돌아갔다.'});return{win:false,ev};
}

/* ---------- 뽑기 ---------- */
function rollRarity(rand=Math.random){let x=rand();for(const[r,p]of PULL_RATE){if(x<p)return r;x-=p}return 1}
function pull(rand=Math.random){const r=rollRarity(rand),pool=POOL[r];return pool[Math.floor(rand()*pool.length)]}

if(typeof module!=='undefined')module.exports={EL,emult,SP,DEX,POOL,REG,need,stats,bossStats,BOSSK,giveXp,battle,pull,MAXLV};
