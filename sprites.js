/* 몬스터 도트 — 왼쪽 절반만 그리면 좌우대칭으로 완성되고, 외곽선·명암은 자동으로 입혀짐 */
"use strict";
const PAL={k:'#1e1a2e',w:'#ffffff',y:'#ffd84a',o:'#ff8a3d',r:'#e8433a',b:'#4aa8ff',B:'#2a62c8',c:'#a8e4ff',
  G:'#58c05a',g:'#a8e878',n:'#a8784a',N:'#6a4a32',p:'#9a6ae0',P:'#4e2e80',s:'#ff9ac0',t:'#fff0b8',
  e:'#8a8a9a',m:'#3a8a8a'};
const NOSHADE='kwy';
const SPRDEF={
 hwado:[".......r","......ry","......yo","...ooooo","..oooooo",".oooowko",".ooookko",".ooooooo","..ooyyyy","..ooyyyy","...ooyyy","..oo...."],
 hwado2:[".r....ry",".rr..ryy","..rrryoo","..rrrrrr",".rrrrrrr","rrrrwkrr","rrrrkkrr","rrrrrrrr",".rryyyyy",".rryyyyy","rrryyyyy","r.rryyyy","..rrr...","..rr...."],
 mul:[".......b","......bb",".....bbb","....bbbb","...bbbbb","..bcbbbb","..bbbwkb","..bbbkkb",".bbbsbbb",".bbbbbbb",".bbbbbbb","..bbbbbb","...BBBBB"],
 mul2:["c.....cc","cc...ccb",".cc.cbbb","..bbbbbb",".bbbbbbb","bbcbbbbb","bbbbbwkb","bbbbbkkb","bbbbsbbb","bbbbbbbb",".bbbbbbb","..bbbbbb","...BBBBB"],
 kong:["....g...","....gg.G","......GG",".....GGG","...GGGGG","..GGGGGG","..GGGwkG","..GGGkkG","..GGsGGG","..GGGGGG","...GGGGG","...GG..."],
 kong2:["...s.s..","..sys.s.","...s...G","....GGGG","..GGGGGG",".GGGGGGG",".GgGGwkG",".GGGGkkG",".GGGsGGG","gGGGGGGG","g.GGGGGG","...GGGGG","...GG..."],
 tokki:["..tt....","..tst...","..tst...","..tst...","..ttt...",".ttttttt","tttttttt","ttttwktt","ttttkktt","ttsttttt","tttttttt",".ttttttt","..tt...."],
 tokki2:["..yyyyyy","........","..tt....","..tst...","..tst...","..ttt...",".ttttttt","tttttttt","ttttwktt","ttttkktt","ttsttttt","tttttttt",".tttyyyy","..tt...."],
 nyang:["........",".p......",".pp.....",".ppppppp","pppppppp","pppyykpp","pppyykpp","pppppppp","pppppppk",".ppppppp","..pppppp","..pp..pp"],
 nyang2:["P.......","PP......","PPP.....","PPPPPPPP","PPPPPPPP","PPPrrkPP","PPPrrkPP","PPPPPPPP","PPPPPPkw","PPPPPPPP",".PPPPPPP","..PPPPPP","..PP..PP"],
 dudu:["........","...NNNNN","..NNNNNN",".NNNNNNN",".NNNwkNN",".NNNkkNN",".NNNNNNs",".NNNNNNN","NNNrNNNN","NNNNrNNN","NNNNNNNN","yyNNNNNN","..NN..NN"],
 turtle:["......tt",".....ttt",".....ktt",".....ttt","..GGGGGG",".GgGGgGG","GGGGGgGG","GgGGGGGG","GGGGgGGG",".GGGGGGG","..tttttt","tt......"],
 lion:["..o.o.o.",".ooooooo","oooooooo","oooyyyyy","ooyyyyyy","ooyywkyy","ooyykkyy","ooyyyyyy","ooyyyyyr","oooyyyyy","oooooyyy",".ooooyyy","..yyyyyy","..yy..yy"],
 whale:[".....c.c","......c.","......B.",".....BBB","...BBBBB","..BBBBBB",".BBBBBBB","BBBBwkBB","BBBBkkBB","BBBBBBBB","BBcccccc","BBcccccc",".BBccccc","..BBBBBB"],
 tree:["...gGGGG","..GGGGgG",".GGgGGGG","GGGGGGgG","GGgGGGGG",".GGGGGGG","...nnnnn","...nnwkn","...nnkkn","...nnnnn","...nnnnk","..nnnnnn",".nn.nnnn","nn....nn"],
 b1:["......y.y.","......yyyy","..GG..GGGG",".GwkGGGGGG",".GkkGGGGGG",".GGGGGGGGG","GGGGGGGGGG","GGGGGGGGGG","GsGGGGGGGG","GGkkkkkkkk","GGGGgggggg",".GGggggggg","..GGgggggg","GG.GGGG...","GGG.GGG..."],
 b2:["bb........","bbb.....k.","b.b.....b.","bbb...bbbb",".bb..bbbbb","..bbbbbbbb","...bbbbbbb","..bbbbbbbb","..bcbbbbbb","...bbbbbbb","..b.b.b...",".b.b.b...."],
 b3:["...NNNNNNN","..NNNNNNNN","..NNNyyNNN","..NNNNNNNN","NNNNNNNNNN","NNoNNNNNNN","NNNNNNrNNN","NNNNNNNrrN","NN.NNNNNNN","NN.NNNNNNN","...NNNN...","...NNNN...","..NNNNN..."],
 b4:["P.........","PP........","PPP.....y.","PPPP....yy","PPPPP..ppp","PPPPPPpppp","PPPPPPprrp","PPPPPPpppp","PPPPPPpppw","..PPP.pppp","......pppp",".......pp."],
 b5:["y.......t.","yy.....tt.",".y....tttt","......tttt","......ttkt","......tttt","yy....tttt","yyy..ttttt","yyyyyttttt","yyyyyttttt",".yyy.ttttt","......tt.t",".....tt..."]
};
function hex2(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mix(c,t,a){const[r,g,b]=hex2(c);return`rgb(${Math.round(r+(t-r)*a)},${Math.round(g+(t-g)*a)},${Math.round(b+(t-b)*a)})`}
function bake(rows,mode){ // mode: n(일반) f(흰색 깜빡임) s(실루엣) d(어둡게=야생)
  const h=rows.length,w=rows[0].length,cv=document.createElement('canvas');cv.width=w+2;cv.height=h+2;const c=cv.getContext('2d');
  const at=(x,y)=>(y<0||y>=h||x<0||x>=w)?'.':rows[y][x];
  for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){const ch=at(x,y);
    if(ch==='.'){if([at(x-1,y),at(x+1,y),at(x,y-1),at(x,y+1)].some(n=>n!=='.')){c.fillStyle=mode==='f'?'#fff':mode==='s'?'#3a3f5a':'#1e1a2e';c.fillRect(x+1,y+1,1,1)}continue}
    let col=PAL[ch];
    if(mode==='f')col='#fff';else if(mode==='s')col='#3a3f5a';
    else{ if(!NOSHADE.includes(ch)){
        if(at(x,y-1)!==ch||at(x-1,y)!==ch)col=mix(col,255,.3);
        else if(at(x,y+1)!==ch||at(x+1,y)!==ch)col=mix(col,0,.28);}
      if(mode==='d')col=mix(col.startsWith('#')?col:'#888888',40,.0)}
    c.fillStyle=col;c.fillRect(x+1,y+1,1,1)}
  return cv;
}
const SPR={};
function initSprites(){
  for(const[k,half]of Object.entries(SPRDEF)){
    const rows=half.map(r=>r+[...r].reverse().join(''));
    SPR[k]={n:bake(rows,'n'),f:bake(rows,'f'),s:bake(rows,'s')};
  }
}
function drawSpr(ctx,id,x,y,{sc=1,mode='n',flip=false,alpha=1}={}){
  const im=SPR[id][mode],w=im.width*sc,h=im.height*sc;x=Math.round(x);y=Math.round(y);ctx.globalAlpha=alpha;
  if(flip){ctx.save();ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(im,0,0,w,h);ctx.restore()}else ctx.drawImage(im,x,y,w,h);
  ctx.globalAlpha=1;
}
/* 목록용 작은 그림 */
function thumb(id,mode='n',sc=3){const im=SPR[id][mode],c=document.createElement('canvas');c.width=im.width*sc;c.height=im.height*sc;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0,c.width,c.height);c.className='thumb';return c}
