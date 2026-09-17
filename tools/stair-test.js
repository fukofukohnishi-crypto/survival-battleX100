#!/usr/bin/env node
/**
 * 階段テスト
 *   node tools/stair-test.js
 * マップ上の全部の階段について、登れるか・降りられるか・壁をすり抜けないかを確かめる。
 * 高低差まわりの判定（tileFree / walkable / moveEnt）を触ったら必ず実行すること。
 */
const fs=require('fs');
const STUB=`global.window={};global.innerWidth=1280;global.innerHeight=720;global.addEventListener=()=>{};
global.Image=function(){this.src='';};
const _el={style:{},innerHTML:'',textContent:'',value:'all',appendChild(){},addEventListener(){},onclick:null,dataset:{},classList:{add(){},remove(){}}};
global.document={querySelector:()=>_el,addEventListener:()=>{},createElement:()=>({width:0,height:0,getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};`;
const H=`
expMode=1;genWorld();buildMinimap();spawnAll('kni');started=1;player.god=1;
// 高台の階段を1つ選ぶ
const st=stairsList[0];
const sx=Math.floor(st.x/TS),sy=Math.floor(st.y/TS);
const names=['床','壁','階段','高台','岩','家'];
console.log('階段タイル ('+sx+','+sy+') 周囲:');
for(let dy=-1;dy<=1;dy++){
 let row='';
 for(let dx=-1;dx<=1;dx++)row+=names[T(sx+dx,sy+dy)]+' ';
 console.log('   '+row);
}
// 高台がある方向を探す
let dir=null;
for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) if(T(sx+dx,sy+dy)===HIGH) dir=[dx,dy];
console.log('高台の方向:',dir);
// 階段の手前（床側）に立たせて、高台へ向かって歩かせる
player.x=(sx-dir[0])*TS+TS/2;player.y=(sy-dir[1])*TS+TS/2;player.lvl=0;player.onStair=0;
console.log('開始位置のタイル:',names[T(Math.floor(player.x/TS),Math.floor(player.y/TS))],'／lvl',player.lvl);
let log=[];
for(let f=0;f<80;f++){
 moveEnt(player,dir[0]*2.3,dir[1]*2.3);
 const t=T(Math.floor(player.x/TS),Math.floor(player.y/TS));
 log.push(names[t]+':lvl'+player.lvl);
}
// 変化した所だけ表示
let prev='';const compact=[];
for(const l of log){if(l!==prev){compact.push(l);prev=l;}}
console.log('歩いた軌跡:',compact.join(' → '));
console.log('結果:',player.lvl===1?'OK 高台に登れた':'NG 登れない');
// 全部の階段で試す
let ok=0,ng=0;
for(const s of stairsList){
 const x=Math.floor(s.x/TS),y=Math.floor(s.y/TS);
 let d=null;
 for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) if(T(x+dx,y+dy)===HIGH) d=[dx,dy];
 if(!d)continue;
 if(T(x-d[0],y-d[1])!==FLOOR)continue;
 player.x=(x-d[0])*TS+TS/2;player.y=(y-d[1])*TS+TS/2;player.lvl=0;player.onStair=0;
 for(let f=0;f<90;f++)moveEnt(player,d[0]*2.3,d[1]*2.3);
 if(player.lvl===1)ok++;else ng++;
}
console.log('全階段での成功率（登り）: '+ok+'/'+(ok+ng));
// 降りられるか
let dok=0,dng=0;
for(const s2 of stairsList){
 const x=Math.floor(s2.x/TS),y=Math.floor(s2.y/TS);
 let d=null;
 for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) if(T(x+dx,y+dy)===HIGH) d=[dx,dy];
 if(!d)continue;
 if(T(x-d[0],y-d[1])!==FLOOR)continue;
 player.x=(x+d[0])*TS+TS/2;player.y=(y+d[1])*TS+TS/2;player.lvl=1;player.onStair=0;
 for(let f=0;f<90;f++)moveEnt(player,-d[0]*2.3,-d[1]*2.3);
 if(player.lvl===0)dok++;else dng++;
}
console.log('全階段での成功率（降り）: '+dok+'/'+(dok+dng));
// 高台から壁を越えて落ちられないか
let leak=0;
for(const s2 of stairsList.slice(0,20)){
 const x=Math.floor(s2.x/TS),y=Math.floor(s2.y/TS);
 let d=null;
 for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) if(T(x+dx,y+dy)===HIGH) d=[dx,dy];
 if(!d)continue;
 player.x=(x+d[0])*TS+TS/2;player.y=(y+d[1])*TS+TS/2;player.lvl=1;player.onStair=0;
 // 高台の奥へ押し続ける。降りるなら必ず階段を通っているはず
 let usedStair=false;
 for(let f=0;f<120;f++){
  moveEnt(player,d[0]*2.3,d[1]*2.3);
  if(T(Math.floor(player.x/TS),Math.floor(player.y/TS))===STAIR)usedStair=true;
 }
 const t=T(Math.floor(player.x/TS),Math.floor(player.y/TS));
 if((t===FLOOR||player.lvl===0)&&!usedStair)leak++;
}
console.log('高台から壁を突き抜けた回数: '+leak+' / 20',leak===0?'OK すり抜けなし':'NG');
// CPUも登れるか（試合中に高台にいる人数を数える）
for(let f=0;f<3750*2;f++){gt+=16;for(const e of ents)updateEnt(e,16);}
console.log('2分後に高台にいるCPU: '+ents.filter(e=>e.alive&&e.lvl===1).length+'人 / 生存'+alive+'人');
if(ok===0||dok===0||leak>0||ng>0||dng>0){
 console.log('NG: 登れなかった '+ng+' 箇所／降りられなかった '+dng+' 箇所／すり抜け '+leak+' 回');
 process.exit(1);
}
console.log('OK');
`;
new Function(STUB+fs.readFileSync(require('path').join(__dirname,'..','js','game.js'),'utf8')+H)();
