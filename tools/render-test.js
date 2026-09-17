#!/usr/bin/env node
/**
 * 描画テスト
 *   node tools/render-test.js
 * canvasの代わりに「呼ばれた命令を数えるだけの偽物」を使って draw() を実際に走らせる。
 * 全500種の武器を持たせた状態と、ボス戦・落雷・地図・スマホ表示など9つの場面を描いて、
 * 例外が出ないことを確かめる。tools/sim.js はロジックだけで描画を通らないので、
 * 見た目に関わる変更をしたらこちらも実行すること。
 */
const fs=require('fs');
// canvasの代わりに、呼ばれたメソッドを記録するだけの偽物を使う
const calls={};
const mkCtx=()=>new Proxy({},{get(t,k){
 if(k==='canvas')return {width:1280,height:720};
 if(k==='createImageData')return (w,h)=>({data:new Uint8ClampedArray(w*h*4)});
 if(k==='createRadialGradient'||k==='createLinearGradient')return ()=>({addColorStop(){}});
 if(k==='measureText')return ()=>({width:40});
 if(typeof k==='string'&&!(k in t))return (...a)=>{calls[k]=(calls[k]||0)+1;};
 return t[k];
},set(t,k,v){t[k]=v;return true;}});
const STUB=`const calls={};global.calls=calls;global.window={ontouchstart:null};global.innerWidth=1280;global.innerHeight=720;global.addEventListener=()=>{};
global.devicePixelRatio=2;
global.Image=function(){this.src='';};
const _ctx=(${mkCtx.toString()})();
const _el={style:{},innerHTML:'',textContent:'',value:'all',appendChild(){},addEventListener(){},onclick:null,dataset:{},classList:{add(){},remove(){}},getContext:()=>_ctx,getBoundingClientRect:()=>({left:0,top:0}),width:0,height:0};
global.document={querySelector:()=>_el,addEventListener:()=>{},createElement:()=>({width:0,height:0,getContext:()=>_ctx})};
`;
const H=`
cv=_el;ctx=_ctx;W=1280;H=720;
expMode=0;genWorld();buildMinimap();spawnAll('kni');started=1;
atlasOK=1;atlas={};                    // 画像は読み込めた前提にする
let err=0;
// 500種すべてを持たせて描画してみる
for(let i=0;i<BASES.length;i++){
 for(const r of [0,6]){
  player.wp[0]=makeWeapon(i,r);player.swingT=100;
  try{draw();}catch(e){console.log('ERR 基礎'+i+' '+BASES[i].n+' ランク'+r+': '+e.message);err++;if(err>3)break;}
 }
}
for(const s of SPECIALS.concat([{id:'expgun'}])){
 player.wp[0]=makeSpecial(s.id);player.swingT=100;player.blade=1;
 try{draw();}catch(e){console.log('ERR 特別 '+s.id+': '+e.message);err++;}
}
// 各種の状況でも描けるか
const scenes=[
 ['通常',()=>{}],
 ['ボス戦',()=>{const b=bossList[0];player.x=b.x+150;player.y=b.y;b.beamT=2000;b.beamLen=400;b.rest=0;}],
 ['チャンスタイム',()=>{bossList[0].rest=5000;bossList[0].beamT=0;}],
 ['落雷と炎',()=>{thunderStrike(player.x+100,player.y,bossList[1],40,3,500,150);hazards.push({x:player.x,y:player.y,r:90,l:3000,dmg:9,burn:3,o:bossList[3],c:'#ff8a3d'});}],
 ['バリアと土壁',()=>{barriers.push({x:player.x+60,y:player.y,r:90,l:3000,ml:6000,owner:'x'});barriers.push({x:player.x-60,y:player.y,r:40,l:3000,ml:9000,owner:'x',earth:1});}],
 ['地面に武器',()=>{for(let k=0;k<12;k++)dropItem(player.x+rnd(-200,200),player.y+rnd(-200,200),'w',randomWeapon(1));}],
 ['地図を開く',()=>{mapOpen=true;}],
 ['スマホ表示',()=>{W=390;H=844;mapOpen=false;}],
 ['実験モード10枠',()=>{W=1280;H=720;expMode=1;player.wp=[];for(let k=0;k<10;k++)player.wp.push(k<7?randomWeapon(1):null);}],
];
for(const [name,fn] of scenes){
 try{fn();draw();draw();console.log('  '+name+': OK');}
 catch(e){console.log('  '+name+': ERR '+e.message+' @'+e.stack.split('\\n')[1].trim());err++;}
}
console.log('描画で呼ばれたcanvasの命令:',Object.keys(calls).length,'種類／drawImage',calls.drawImage||0,'回');
console.log('エラー合計:',err,err===0?'OK':'NG');
if(err>0)process.exit(1);
`;
new Function(STUB+fs.readFileSync(require('path').join(__dirname,'..','js','game.js'),'utf8')+H)();
