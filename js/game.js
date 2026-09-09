'use strict';
/* ============ サバイバルバトルX100 ============ */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const TAU=Math.PI*2;
const now=()=>performance.now();

/* ---------- ランク ---------- */
const RANKS=[
 {k:'白',   pre:'粗製',  c:'#e6ecf5', m:1.00, w:355},
 {k:'緑',   pre:'良質',  c:'#4ade80', m:1.38, w:255},
 {k:'青',   pre:'精製',  c:'#4b9dff', m:1.85, w:180},
 {k:'黒',   pre:'漆黒',  c:'#8b7bd8', m:2.45, w:100},
 {k:'銀',   pre:'白銀',  c:'#cdd8e6', m:3.15, w:70},
 {k:'金',   pre:'黄金',  c:'#ffc63a', m:4.10, w:32},
 {k:'虹',   pre:'虹幻',  c:'rainbow',m:5.40, w:8},
];
const RANKW=RANKS.map(r=>r.w);
function rollRank(bonus){
 let w=RANKW.slice();
 if(bonus){for(let i=3;i<7;i++)w[i]*=bonus;}
 let s=w.reduce((a,b)=>a+b,0),r=Math.random()*s;
 for(let i=0;i<w.length;i++){r-=w[i];if(r<=0)return i;}
 return 0;
}
function rankColor(i,t){
 if(RANKS[i].c!=='rainbow')return RANKS[i].c;
 return 'hsl('+((t||now())/6%360)+',95%,65%)';
}

/* ---------- 武器ベース(70種) ---------- */
function M(n,d,cd,rc,e,desc){return{n,t:'m',d,cd,rc,e:e||{},desc};}
function R(n,d,cd,rng,sp,cnt,sprd,am,e,desc){return{n,t:'r',d,cd,rng,sp,cnt,sprd,am,e:e||{},desc};}
const BASES=[
 M('鉄パイプ',14,420,52,{},'どこにでも落ちている鈍器。振りが素直。'),
 M('木刀',12,340,56,{},'軽くて速い。基本に忠実な一振り。'),
 M('錆びた斧',20,620,50,{},'重い一撃。当たれば大きい。'),
 M('ダガー',9,190,40,{crit:2.2},'高速の刺突。まれに急所を貫く。'),
 M('大槌',34,980,62,{knock:9,aoe:44},'着弾点を叩き潰し、まとめて吹き飛ばす。'),
 M('鎖鎌',15,560,96,{pull:5},'刃を投げて相手を引き寄せる。'),
 M('双剣',8,220,46,{multi:2},'二連撃。手数で押す。'),
 M('薙刀',18,520,86,{},'長い間合いから薙ぎ払う。'),
 M('鉄扇',11,360,48,{guard:6},'振るたびに防御力が少し戻る。'),
 M('ツルハシ',13,440,46,{breaker:3},'宝箱の破壊が非常に速い。'),
 M('チェーンソー',5,90,44,{bleed:4},'触れ続ける限り削り続ける。'),
 M('電磁バトン',10,400,46,{stun:0.7},'感電させて相手の動きを止める。'),
 M('氷結クナイ',11,300,44,{slow:1.4},'凍てつく刃。相手を鈍足にする。'),
 M('焔の直刀',13,380,56,{burn:6},'斬った相手を燃やし続ける。'),
 M('毒塗りの鉈',12,420,48,{poison:8},'毒が回り、じわじわ体力を奪う。'),
 M('巨大スパナ',22,680,56,{knock:6},'工具とは思えない破壊力。'),
 M('アンカーフック',17,700,110,{pull:12},'遠くの敵を力任せに引きずり寄せる。'),
 M('磁力グローブ',7,260,42,{magnet:1},'周囲のアイテムを吸い寄せる。'),
 M('ヒートナックル',8,170,34,{burn:3},'超接近戦用。連打が速い。'),
 M('鋼糸ワイヤー',10,330,120,{pierceM:1},'細い糸が一直線上の敵を切り裂く。'),
 M('岩石ハンマー',26,820,58,{aoe:70,knock:7},'地面を割って衝撃波を広げる。'),
 M('蒼雷の槍',16,480,90,{chain:3},'雷が敵から敵へ飛び移る。'),
 M('骨断ちの大剣',30,760,70,{},'重量級。一撃の重さが違う。'),
 M('竹槍',10,300,82,{},'安いが長い。数を撃てる。'),
 M('傘剣',12,400,54,{guard:10},'受けと攻めを同時にこなす。'),
 M('光刃レイピア',13,260,66,{pierceM:1},'光の刺突が直線状を貫通する。'),
 M('重力メイス',19,640,54,{pull:8,aoe:60},'小さな重力場で敵を巻き込む。'),
 M('血染めの鎌',16,520,62,{life:0.3},'与えた傷の一部を体力に変える。'),
 M('断層ブレード',21,600,76,{aoe:50},'地面ごと切り裂く広範囲の斬撃。'),
 M('双頭斧',24,700,60,{multi:2},'左右の刃で二度斬る。'),
 M('音叉トンファー',9,230,40,{stun:0.4},'共鳴音で相手をふらつかせる。'),
 M('結晶の爪',7,150,36,{multi:3},'三連の斬撃。異常な手数。'),
 M('溶鉱スレッジ',28,880,60,{burn:10,aoe:64},'溶けた鉄をまき散らす大槌。'),
 M('錨',31,900,66,{knock:12},'船の錨。命中した相手は遥か彼方へ。'),
 M('星屑の大太刀',23,560,88,{aoe:40},'刃の軌跡に星屑が舞う長刀。'),
 R('ハンドガン',12,300,620,13,1,0.03,1,{},'扱いやすい標準的な拳銃。'),
 R('リボルバー',20,520,700,15,1,0.02,1,{},'一発が重い回転式拳銃。'),
 R('ショットガン',7,680,340,12,6,0.22,2,{knock:4},'至近距離で全弾当てれば圧倒的。'),
 R('ダブルバレル',9,820,320,12,8,0.26,2,{knock:5},'二連装。ばら撒いて薙ぎ倒す。'),
 R('サブマシンガン',7,110,520,13,1,0.09,1,{},'弾をばら撒く近距離向け連射銃。'),
 R('アサルトライフル',10,150,700,16,1,0.06,1,{},'距離を選ばない万能自動小銃。'),
 R('バトルライフル',15,260,760,17,1,0.04,1,{},'重い弾を中距離へ正確に。'),
 R('スナイパーライフル',40,1100,1100,26,1,0.005,1,{pierce:2},'遠距離から確実に仕留める。'),
 R('対物ライフル',60,1600,1200,30,1,0.004,2,{pierce:3,knock:8},'壁の向こうの敵まで撃ち抜く。'),
 R('ロケットランチャー',45,1500,800,8,1,0.01,3,{aoe:110,knock:10},'着弾点を爆破する。自爆注意。'),
 R('グレネードランチャー',30,1000,620,9,1,0.03,2,{aoe:90,bounce:2},'跳ねて転がり、爆発する。'),
 R('クロスボウ',26,800,780,20,1,0.01,1,{pierce:1},'静かで強力な機械弓。'),
 R('コンパウンドボウ',18,620,900,18,1,0.02,1,{charge:1},'引き絞るほど速く、遠く、強く。'),
 R('投擲ナイフ',14,330,480,16,1,0.05,1,{},'素早く投げる刃。弾持ちが良い。'),
 R('手裏剣ランチャー',8,280,460,15,3,0.16,1,{},'三枚同時に飛ばす。'),
 R('火炎放射器',4,60,200,9,2,0.30,1,{burn:5,short:1},'超至近距離を火の海にする。'),
 R('冷却ガン',5,90,260,10,1,0.18,1,{slow:1.2},'冷気で相手の足を止める。'),
 R('酸噴射器',5,100,250,10,1,0.20,1,{poison:7},'装甲ごと溶かす酸を噴く。'),
 R('テスラガン',11,380,480,18,1,0.03,1,{chain:4},'放電が近くの敵へ次々に伝わる。'),
 R('レーザーピストル',13,260,820,30,1,0.01,1,{pierce:2},'弾速が速く、狙った線を撃ち抜く。'),
 R('プリズムライフル',9,420,700,20,3,0.10,2,{split:1},'着弾で光が分裂して散る。'),
 R('パルスカービン',11,420,680,19,3,0.05,1,{burst:1},'三点バーストの制御された連射。'),
 R('ガウスガン',34,1200,1000,34,1,0.005,2,{pierce:4,charge:1},'電磁加速。溜めるほど貫通が伸びる。'),
 R('ネイルガン',5,80,380,14,1,0.12,1,{},'釘を高速で撃ち込む。'),
 R('ボルトキャスター',17,460,720,19,1,0.03,1,{stun:0.4},'電磁ボルトで相手を硬直させる。'),
 R('プラズマSMG',9,130,560,15,1,0.08,1,{burn:3},'高熱の弾を連射する。'),
 R('重力ランチャー',18,950,600,10,1,0.02,2,{pull:14,aoe:120},'重力弾。敵をまとめて引き寄せる。'),
 R('音波砲',13,620,300,14,4,0.30,2,{knock:12,stun:0.5},'衝撃波で前方を吹き飛ばす。'),
 R('種子銃',8,420,520,13,1,0.05,1,{slow:2.4},'着弾点で発芽し、相手を絡め取る。'),
 R('ホーミングミサイラー',22,900,900,7,2,0.12,2,{homing:1,aoe:60},'追尾する小型ミサイルを二発。'),
 R('スイングボム',24,950,500,11,1,0.04,2,{bounce:3,aoe:80},'壁で跳ね回る爆弾。'),
 R('治癒弾ライフル',6,500,600,16,1,0.03,1,{heal:14},'撃つたび自分の傷が塞がる。'),
 R('星屑ショットガン',10,760,420,15,7,0.20,2,{pierce:1},'貫通する光の粒をばら撒く。'),
 R('磁気レールピストル',24,700,950,40,1,0.006,1,{pierce:2},'極めて速い弾を一直線に。'),
 R('分裂弾ランチャー',16,880,660,12,1,0.03,2,{split:2,aoe:50},'着弾で二つに割れて再爆発する。'),
];

/* ---------- 特別武器(10種・すべて虹) ---------- */
const SPECIALS=[
 {id:'bow',   n:'木の弓',        t:'r',abs:1,d:26,cd:500,rng:1150,sp:20,cnt:1,sprd:0.01,am:0,e:{charge:1,arrow:1},desc:'チャージするほど速く遠くへ飛ぶ。弾薬を使わない。'},
 {id:'para',  n:'日傘',          t:'m',abs:1,d:16,cd:420,rc:52,e:{guard:22,sun:1,block:1},desc:'サブ動作で受け。太陽光を反射して相手をスタンさせる。'},
 {id:'sword', n:'騎士の剣',      t:'m',abs:1,d:32,cd:400,rc:66,e:{},desc:'癖のない正統派の剣。安定して強い。'},
 {id:'lance', n:'硬めの槍',      t:'m',abs:1,d:29,cd:520,rc:112,e:{pierceM:1},desc:'長いリーチ。直線状の敵をまとめて突く。'},
 {id:'mg',    n:'マシンガン',    t:'r',abs:1,d:13,cd:85,rng:660,sp:17,cnt:1,sprd:0.07,am:1,e:{},desc:'名前の通り。圧倒的な制圧射撃。'},
 {id:'sashi', n:'お刺身ナイフガン',t:'r',abs:1,d:21,cd:420,rng:640,sp:18,cnt:1,sprd:0.02,am:0,e:{sashimi:1},desc:'ナイフの匂いに魚が寄り、三枚おろしになって食料が手に入る。'},
 {id:'turbo', n:'ターボマシンガンHULL',t:'r',abs:1,d:5,cd:0.0001,rng:560,sp:17,cnt:9,sprd:0.17,am:1,e:{turbo:1},desc:'発射口9門。次弾まで0.0001秒という尋常でない連射速度で、弾幕そのものを撃ち出す。',boss:1},
 {id:'rail',  n:'プラズマボトルレールガン',t:'r',abs:1,d:95,cd:1750,rng:1500,sp:48,cnt:1,sprd:0,am:3,e:{charge:1,aoe:190,chain:5,rail:1},desc:'電気の球をレールで極限まで加速し、着弾点に巨大な電磁爆発。さらに狙った地点へ、壁も段差も無視して落雷を降らせる。',boss:1},
 {id:'blade', n:'バリアブレード',t:'m',abs:1,d:54,cd:620,rc:100,e:{barrier:1,aoe:64},desc:'空気ごと斬り、斬った線に大きなバリアを張る。自分以外は誰も入れない。Xキーで刃にバリアを纏うと威力4倍＋バリア斬撃を飛ばせる（1分間・その後10秒は使用不能）。',boss:1},
 {id:'spear', n:'雷炎水土神槍',  t:'m',abs:1,d:46,cd:460,rc:104,e:{elem:1},desc:'Xキーで属性変更。火=炎の海／雷=画面端まで壁を無視した落雷（10秒スタン）／水=広範囲の水圧と継続ダメージ／土=一定時間で消える壁。',boss:1},
];
const SP={};SPECIALS.forEach(s=>SP[s.id]=s);
// 実験モード専用。SPECIALS には入れないので図鑑にもドロップにも出ない
SP.expgun={id:'expgun',n:'実験用ショットガン',t:'r',abs:1,d:1e9,cd:400,rng:560,sp:17,cnt:10,sprd:0.26,am:0,
 e:{knock:8,pierce:4},desc:'攻撃力10億。弾薬を消費せず、10発の散弾がすべてを貫く。'};

/* ---------- キャラクター ---------- */
const CHARS=[
 {id:'gob', n:'ゴブリン',      w:'bow',  hp:92, spd:1.14,col:'#7bd36a',desc:'小柄で誰よりも速い。木の弓で距離を制す。',bonus:'移動速度+14%'},
 {id:'mad', n:'マダム',        w:'para', hp:108,spd:0.96,col:'#e08ac0',desc:'日傘で受け、太陽光で相手を焼く。防御力を多めに持って始まる。',bonus:'初期防御+40'},
 {id:'kni', n:'騎士',          w:'sword',hp:135,spd:0.95,col:'#8fb6e8',desc:'重装備。体力が最も高い正面戦闘型。',bonus:'最大体力+35'},
 {id:'min', n:'鉱石コレクター',w:'lance',hp:100,spd:1.02,col:'#e0b25c',desc:'宝箱を壊す速度が段違い。物資で勝つ。',bonus:'宝箱破壊×3・初期回復+2'},
 {id:'sof', n:'特殊部隊の人',  w:'mg',   hp:104,spd:1.06,col:'#93a3b5',desc:'弾薬を大量に携行した銃器のプロ。',bonus:'初期弾薬300'},
 {id:'hun', n:'狩上手な少年',  w:'sashi',hp:96, spd:1.16,col:'#f0d79a',desc:'食料に困らない。空腹の進みも遅い。',bonus:'空腹−50%・初期食料5'},
];

/* ---------- ボス(仮) ---------- */
const BOSSES=[
 {n:'神速の帝王鷹', drop:'turbo',col:'#ffd06a',hp:5200,ab:'clone',  desc:'北西の空を支配する鷹。分身を生み出して襲いかかる。'},
 {n:'雷霧の巨兵',   drop:'rail', col:'#5ec8ff',hp:6000,ab:'thunder',desc:'北東の発電施設を守る巨兵。落雷は3秒間動きを止める。'},
 {n:'蒼盾の守護者', drop:'blade',col:'#7be0c0',hp:5600,ab:'barrier',desc:'南西の聖域に立つ守護者。バリアで攻撃を遮る。'},
 {n:'四神の化身',   drop:'spear',col:'#ff8f5e',hp:6400,ab:'fire',   desc:'南東の祭壇に降りた化身。炎の海を生み出す。'},
];

/* ---------- 武器インスタンス ---------- */
function makeWeapon(baseIdx,rank){
 const b=BASES[baseIdx];
 return{sp:0,b:baseIdx,r:rank,n:RANKS[rank].pre+'・'+b.n};
}
function makeSpecial(id){return{sp:1,id:id,r:6,n:SP[id].n};}
function wdef(w){return w.sp?SP[w.id]:BASES[w.b];}
function wdmg(w){const d=wdef(w);return d.abs?d.d:d.d*RANKS[w.r].m;}
function wcol(w,t){return rankColor(w.r,t);}
function randomWeapon(bonus){
 const i=ri(0,BASES.length-1);
 return makeWeapon(i,rollRank(bonus));
}

/* ================= WORLD ================= */
const TS=32, MW=178, MH=178;
const WW=MW*TS, WH=MH*TS;
const FLOOR=0,WALL=1,STAIR=2,HIGH=3,ROCK=4,HOUSE=5;
let grid=new Uint8Array(MW*MH);
const T=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?WALL:grid[y*MW+x];
const setT=(x,y,v)=>{if(x>=0&&y>=0&&x<MW&&y<MH)grid[y*MW+x]=v;};
let chests=[],drops=[],houses=[],barriers=[],stairsList=[],hazards=[],openSpots=[],strikes=[];
let bossList=[];

function fillRect(x,y,w,h,v){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)setT(i,j,v);}
function rectRing(x,y,w,h,v){for(let i=x;i<x+w;i++){setT(i,y,v);setT(i,y+h-1,v);}for(let j=y;j<y+h;j++){setT(x,j,v);setT(x+w-1,j,v);}}
function areaClear(x,y,w,h){for(let j=y-1;j<y+h+1;j++)for(let i=x-1;i<x+w+1;i++){if(T(i,j)!==FLOOR)return false;}return true;}

function addChest(tx,ty,bonus){chests.push({x:tx*TS+TS/2,y:ty*TS+TS/2,hp:60,max:60,op:0,b:bonus||1,lvl:T(tx,ty)===HIGH?1:0,sh:0});}

function genWorld(){
 grid.fill(FLOOR);chests=[];drops=[];houses=[];barriers=[];bossList=[];stairsList=[];hazards=[];openSpots=[];strikes=[];
 const res=new Uint8Array(MW*MH);
 const mark=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){if(i>=0&&j>=0&&i<MW&&j<MH)res[j*MW+i]=1;}};
 const free=(x,y,w,h)=>{for(let j=y-1;j<y+h+1;j++)for(let i=x-1;i<x+w+1;i++){if(i<0||j<0||i>=MW||j>=MH)return false;if(res[j*MW+i])return false;}return true;};
 for(let i=0;i<3;i++)rectRing(i,i,MW-i*2,MH-i*2,WALL);
 mark(0,0,MW,4);mark(0,MH-4,MW,4);mark(0,0,4,MH);mark(MW-4,0,4,MH);
 // ボス闘技場の場所を先に確保
 const corners=[[24,24],[MW-24,24],[24,MH-24],[MW-24,MH-24]];
 corners.forEach(c=>mark(c[0]-19,c[1]-19,38,38));

 // 家（必ず宝箱がある）
 let placed=0,tries=0;
 while(placed<52&&tries<9000){
  tries++;
  const w=ri(9,15),h=ri(8,13),x=ri(6,MW-w-6),y=ri(6,MH-h-6);
  if(!free(x,y,w,h))continue;
  mark(x-2,y-2,w+4,h+4);
  fillRect(x,y,w,h,FLOOR);
  rectRing(x,y,w,h,HOUSE);
  const side=ri(0,3);
  if(side===0){const d=ri(x+2,x+w-4);setT(d,y,FLOOR);setT(d+1,y,FLOOR);}
  if(side===1){const d=ri(x+2,x+w-4);setT(d,y+h-1,FLOOR);setT(d+1,y+h-1,FLOOR);}
  if(side===2){const d=ri(y+2,y+h-4);setT(x,d,FLOOR);setT(x,d+1,FLOOR);}
  if(side===3){const d=ri(y+2,y+h-4);setT(x+w-1,d,FLOOR);setT(x+w-1,d+1,FLOOR);}
  // 中二階（階段付き）
  if(Math.random()<0.5){
   const pw=ri(4,w-5),ph=ri(3,h-4);
   fillRect(x+1,y+1,pw,ph,HIGH);
   const sx=x+pw+1,sy=y+ri(1,Math.max(1,ph-1));
   if(sx<x+w-1)setT(sx,sy,STAIR);
  }
  const nc=ri(1,3);
  for(let i=0;i<nc;i++){
   for(let a=0;a<24;a++){
    const cx=ri(x+1,x+w-2),cy=ri(y+1,y+h-2),t=T(cx,cy);
    if(t===FLOOR||t===HIGH){addChest(cx,cy,1.9);break;}
   }
  }
  houses.push({x:x*TS,y:y*TS,w:w*TS,h:h*TS});
  placed++;
 }
 // 高台（階段で登れる）
 let pl=0,pt=0;
 while(pl<38&&pt<4000){
  pt++;
  const w=ri(9,18),h=ri(8,16),x=ri(6,MW-w-6),y=ri(6,MH-h-6);
  if(!free(x,y,w,h))continue;
  mark(x-1,y-1,w+2,h+2);
  fillRect(x,y,w,h,HIGH);
  rectRing(x,y,w,h,WALL);
  const nst=ri(1,3);
  for(let s=0;s<nst;s++){
   if(Math.random()<0.5){const sx=ri(x+1,x+w-2);setT(sx,Math.random()<0.5?y:y+h-1,STAIR);}
   else{const sy=ri(y+1,y+h-2);setT(Math.random()<0.5?x:x+w-1,sy,STAIR);}
  }
  if(Math.random()<0.8){const cx=ri(x+2,x+w-3),cy=ri(y+2,y+h-3);if(T(cx,cy)===HIGH)addChest(cx,cy,1.4);}
  pl++;
 }
 // 岩
 for(let k=0;k<700;k++){
  const cx=ri(6,MW-7),cy=ri(6,MH-7),n=ri(2,9);
  for(let i=0;i<n;i++){
   const x=cx+ri(-2,2),y=cy+ri(-2,2);
   if(x<0||y<0||x>=MW||y>=MH)continue;
   if(res[y*MW+x])continue;
   if(T(x,y)===FLOOR)setT(x,y,ROCK);
  }
 }
 // ボス闘技場
 corners.forEach((c,i)=>{
  const [cx,cy]=c,R0=15;
  for(let y=cy-R0-1;y<=cy+R0+1;y++)for(let x=cx-R0-1;x<=cx+R0+1;x++){
   const d=Math.hypot(x-cx,y-cy);
   if(d<R0-0.5)setT(x,y,FLOOR);
   else if(d<R0+0.9)setT(x,y,WALL);
  }
  const a=[0,Math.PI/2,Math.PI,-Math.PI/2][i]+Math.PI*0.75;
  for(let k=-2;k<=2;k++){
   const ax=Math.round(cx+Math.cos(a+k*0.05)*R0),ay=Math.round(cy+Math.sin(a+k*0.05)*R0);
   setT(ax,ay,FLOOR);setT(ax+1,ay,FLOOR);setT(ax,ay+1,FLOOR);
  }
  // 闘技場は平らにする（中央を高台にすると、地上からの弾が段差で止まってボスに当たらない）
  fillRect(cx-5,cy-5,10,10,FLOOR);
  [[cx-9,cy-9],[cx+8,cy-9],[cx-9,cy+8],[cx+8,cy+8]].forEach(p=>{setT(p[0],p[1],ROCK);setT(p[0]+1,p[1],ROCK);setT(p[0],p[1]+1,ROCK);});
  const B=BOSSES[i];
  bossList.push({boss:1,id:'boss'+i,i,x:cx*TS,y:cy*TS,hx:cx*TS,hy:cy*TS,hp:B.hp,max:B.hp,r:52,def:B,ang:0,alive:1,at:0,at2:0,tgt:null,hit:0,lvl:0,phase:0,name:B.n,inv:5000,rest:0,beamCd:7000,beamWarn:0,beamT:0,beamAng:0,beamLen:0,beamTick:0,abCd:6000,marks:[]});
  addChest(cx-8,cy-8,2.6);addChest(cx+8,cy+8,2.6);
 });
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(grid[y*MW+x]===STAIR)stairsList.push({x:x*TS+TS/2,y:y*TS+TS/2});}
 // 野良宝箱
 for(let k=0;k<330;k++){
  for(let a=0;a<30;a++){
   const x=ri(4,MW-5),y=ri(4,MH-5);
   if(T(x,y)===FLOOR){addChest(x,y,1);break;}
  }
 }
 // 開けた場所を先に集めておく（毎回探すと重いため）
 for(let k=0;k<1600;k++){
  const x=ri(5,MW-6),y=ri(5,MH-6);
  if(T(x,y)!==FLOOR)continue;
  let ok=true;
  for(const b of bossList){if(Math.hypot(b.x-x*TS,b.y-y*TS)<TS*24){ok=false;break;}}
  if(ok)openSpots.push({x:x*TS+TS/2,y:y*TS+TS/2});
 }
}

function freeSpot(cell){
 if(openSpots.length){
  if(cell!==undefined&&cell!==null&&cell!==0){
   const g=16,cw=Math.floor((MW-12)/g);
   const gx=cell%g,gy=Math.floor(cell/g)%g;
   const x0=(6+gx*cw)*TS,y0=(6+gy*cw)*TS,x1=x0+cw*TS,y1=y0+cw*TS;
   const inCell=[];
   for(const p of openSpots)if(p.x>=x0&&p.x<x1&&p.y>=y0&&p.y<y1)inCell.push(p);
   if(inCell.length){const p=pick(inCell);return{x:p.x,y:p.y};}
  }
  const p=pick(openSpots);return{x:p.x,y:p.y};
 }
 for(let y=5;y<MH-5;y++)for(let x=5;x<MW-5;x++){if(T(x,y)===FLOOR)return{x:x*TS+TS/2,y:y*TS+TS/2};}
 return{x:WW/2,y:WH/2};
}

/* ------- 終盤用の経路探索 -------
   残りわずかになると、壁を挟んで延々とすれ違う事故が起きる。
   その時だけ目標地点から幅優先探索をして、次に進むべき隣のマスを返す。 */
const _dist=new Int32Array(MW*MH), _que=new Int32Array(MW*MH);
function passTile(t){return t===FLOOR||t===HIGH||t===STAIR;}
function canStep(a,b){
 if(!passTile(a)||!passTile(b))return false;
 if(a===STAIR||b===STAIR)return true;
 return (a===HIGH)===(b===HIGH);
}
function pathStep(sx,sy,tx,ty){
 const sxT=Math.floor(sx/TS),syT=Math.floor(sy/TS);
 const txT=clamp(Math.floor(tx/TS),1,MW-2),tyT=clamp(Math.floor(ty/TS),1,MH-2);
 if(!passTile(T(txT,tyT))||!passTile(T(sxT,syT)))return null;
 _dist.fill(-1);
 let head=0,tail=0;
 _que[tail++]=tyT*MW+txT;_dist[tyT*MW+txT]=0;
 const startIdx=syT*MW+sxT;
 let found=false;
 while(head<tail){
  const cur=_que[head++];
  if(cur===startIdx){found=true;break;}
  const cx=cur%MW,cy=(cur-cx)/MW,ct=grid[cur],cd=_dist[cur];
  if(cd>420)break;
  for(let k=0;k<4;k++){
   const nx=cx+(k===0?1:k===1?-1:0),ny=cy+(k===2?1:k===3?-1:0);
   if(nx<1||ny<1||nx>=MW-1||ny>=MH-1)continue;
   const ni=ny*MW+nx;
   if(_dist[ni]>=0)continue;
   if(!canStep(ct,grid[ni]))continue;
   _dist[ni]=cd+1;_que[tail++]=ni;
  }
 }
 if(!found)return null;
 // 自分のマスから、目標に近づく隣のマスへ
 let best=null,bd=_dist[startIdx];
 const ct=grid[startIdx];
 for(let k=0;k<4;k++){
  const nx=sxT+(k===0?1:k===1?-1:0),ny=syT+(k===2?1:k===3?-1:0);
  const ni=ny*MW+nx;
  if(nx<0||ny<0||nx>=MW||ny>=MH)continue;
  if(_dist[ni]<0||_dist[ni]>=bd)continue;
  if(!canStep(ct,grid[ni]))continue;
  bd=_dist[ni];best={x:nx*TS+TS/2,y:ny*TS+TS/2};
 }
 return best;
}
/* ------- 移動判定 ------- */
function walkable(e,tx,ty){
 const t=T(tx,ty);
 if(t===WALL||t===ROCK||t===HOUSE)return false;
 if(t===STAIR)return true;
 if(t===HIGH)return e.lvl===1||e.onStair;
 return e.lvl===0||e.onStair;
}
function tileFree(e,x,y,r){
 const t0=T(Math.floor(x/TS),Math.floor(y/TS));
 e.onStair=(t0===STAIR);
 const pts=[[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r],[x,y-r],[x,y+r],[x-r,y],[x+r,y]];
 for(const p of pts){if(!walkable(e,Math.floor(p[0]/TS),Math.floor(p[1]/TS)))return false;}
 for(const b of barriers){if(b.owner!==e.id&&Math.hypot(b.x-x,b.y-y)<b.r+r)return false;}
 return true;
}
function moveEnt(e,dx,dy){
 const r=e.r||12;
 if(dx&&tileFree(e,e.x+dx,e.y,r))e.x+=dx;
 if(dy&&tileFree(e,e.x,e.y+dy,r))e.y+=dy;
 e.x=clamp(e.x,TS,WW-TS);e.y=clamp(e.y,TS,WH-TS);
 const t=T(Math.floor(e.x/TS),Math.floor(e.y/TS));
 if(t===HIGH)e.lvl=1;else if(t===FLOOR||t===ROCK)e.lvl=0;
 e.onStair=(t===STAIR);
}

/* ================= ENTITIES ================= */
const BOTNAMES=['カゲロウ','ハヤブサ','ノーチラス','グリム','ソラ','ツバキ','ゼノ','クロガネ','ミナト','ライカ','ヒスイ','ヴォルフ','アカネ','ドリス','シグマ','ナギ','ベルグ','ユキ','ラント','コハク','ジン','マリン','テオ','ハクア','リヴ','カイト','ノア','ミラ','ゼファー','アオイ','タケル','セラ','ロキ','ヒナ','ガイ','ルナ','シオン','クレイ','エイト','モモ'];
let ents=[],bullets=[],fx=[],dmgTexts=[],feed=[];
let player=null,alive=100,killsTotal=0,gt=0,started=0,gameOver=0,timeAlive=0,expMode=0;

function newEnt(bot,charId,cell){
 const C=CHARS.find(c=>c.id===charId)||pick(CHARS);
 const p=freeSpot(cell);
 const e={
  id:Math.random().toString(36).slice(2),bot,ch:C,name:bot?pick(BOTNAMES)+ri(1,99):'あなた',
  x:p.x,y:p.y,r:12,ang:0,lvl:0,onStair:0,
  hp:C.hp,max:C.hp,guard:C.id==='mad'?40:0,food:100,ammo:C.id==='sof'?300:60,
  items:{heal:C.id==='min'?2:1,pot:1,food:C.id==='hun'?5:1},
  wp:[makeSpecial(C.w),null],cur:0,
  cool:0,charge:0,charging:0,sub:0,elem:0,alive:1,kills:0,dashCd:0,
  burn:0,poison:0,slow:0,stun:0,bleed:0,soak:0,bladeTime:60000,bladeCd:0,
  st:'roam',tx:p.x,ty:p.y,think:0,tgt:null,chestT:null,aggr:0,flash:0,blade:0,sun:0,inv:5000,
  col:C.col
 };
 return e;
}
function spawnAll(charId){
 ents=[];
 player=newEnt(0,charId);ents.push(player);
 if(expMode){
  // 実験モード：CPUなし、無敵、攻撃力10億のショットガン、スロット10
  player.god=1;player.inv=1e12;player.ammo=999999;
  player.wp=[makeSpecial('expgun'),null,null,null,null,null,null,null,null,null];
  player.cur=0;player.items={heal:99,pot:99,food:99};
  alive=1;
  return;
 }
 const cells=[];for(let i=0;i<256;i++)cells.push(i);
 for(let i=cells.length-1;i>0;i--){const j=ri(0,i);const t=cells[i];cells[i]=cells[j];cells[j]=t;}
 for(let i=0;i<99;i++)ents.push(newEnt(1,null,cells[i]));
 alive=100;
}
function curW(e){
 if(e.wp[e.cur])return e.wp[e.cur];
 for(let i=0;i<e.wp.length;i++)if(e.wp[i])return e.wp[i];
 return null;
}
function otherW(e){
 for(let i=0;i<e.wp.length;i++)if(i!==e.cur&&e.wp[i])return{w:e.wp[i],i};
 return null;
}
function addFeed(t,c){feed.unshift({t,c:c||'#cfe',a:1});if(feed.length>6)feed.pop();}

/* ================= COMBAT ================= */
function addFx(x,y,col,n,spd,life,size){
 if(!player)return;
 if(fx.length>760)return;           // 出しすぎ防止（弾幕系の武器で膨れ上がるため）
 if(Math.hypot(x-player.x,y-player.y)>1400)return;
 for(let i=0;i<n;i++){
  const a=Math.random()*TAU,s=rnd(spd*0.3,spd);
  fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:life*rnd(0.6,1),ml:life,c:col,s:size||3});
 }
}
function addText(x,y,t,c){
 if(!player||dmgTexts.length>90)return;
 if(Math.hypot(x-player.x,y-player.y)>1100)return;
 dmgTexts.push({x,y,t,c,l:900,vy:-0.7});
}
function shake(v){cam.sh=Math.min(30,cam.sh+v);}

function hurt(t,dmg,src,eff){
 if(!t.alive||t.dead)return;
 if(t.god)return;
 if(t.inv>0){if(Math.random()<0.4)addText(t.x,t.y-18,'無敵','#9fe8ff');return;}
 let d=dmg;
 if(t.guard>0){const abs=Math.min(t.guard,d*0.55);t.guard-=abs;d-=abs;}
 if(t.sub&&t.blockW)d*=0.35;
 t.hp-=d;t.flash=1;t.lastHit=src;t.hit=1;
 if(eff){
  if(eff.burn)t.burn=Math.max(t.burn,eff.burn*1.4);
  if(eff.poison)t.poison=Math.max(t.poison,eff.poison*1.5);
  if(eff.bleed)t.bleed=Math.max(t.bleed,eff.bleed);
  if(eff.soak)t.soak=Math.max(t.soak,eff.soak);
  if(eff.slow)t.slow=Math.max(t.slow,eff.slow*1000);
  if(eff.stun)t.stun=Math.max(t.stun,eff.stun*1000);
 }
 addText(t.x,t.y-16,Math.round(d),src===player?'#ffe27a':'#ff8a8a');
 addFx(t.x,t.y,'#ff6b6b',3,2,300,2);
 if(t.hp<=0)kill(t,src);
}
function kill(t,src){
 if(t.boss){bossDie(t,src);return;}
 t.alive=0;t.dead=1;alive--;
 if(src&&src!==t){src.kills++;if(src===player)killsTotal++;}
 // ドロップ
 const w=curW(t);
 if(w)dropItem(t.x+rnd(-14,14),t.y+rnd(-14,14),'w',w);
 if(t.ammo>10)dropItem(t.x+rnd(-20,20),t.y+rnd(-20,20),'ammo',Math.floor(t.ammo*0.6));
 if(t.items.heal)dropItem(t.x+rnd(-20,20),t.y+rnd(-20,20),'heal',t.items.heal);
 if(t.items.food)dropItem(t.x+rnd(-20,20),t.y+rnd(-20,20),'food',t.items.food);
 addFx(t.x,t.y,t.col,26,4,700,3);
 if(t===player){gameOver=1;endGame(false);}
 else if(src===player)addFeed('あなた ▸ '+t.name+' を撃破','#ffd166');
 else if(Math.hypot(t.x-player.x,t.y-player.y)<1000)addFeed(((src&&src.name)||'空腹')+' ▸ '+t.name,'#9fb3c8');
}
function dropItem(x,y,type,data){
 drops.push({x,y,type,data,t:0,lvl:T(Math.floor(x/TS),Math.floor(y/TS))===HIGH?1:0});
 if(drops.length>500)drops.shift();
}

const BARE={n:'素手',t:'m',d:7,cd:520,rc:34,e:{},abs:1};
function usableDef(e){
 const w=curW(e);
 if(!w)return{d:BARE,w:null};
 const d=wdef(w);
 if(d.e.barrier&&e.bladeCd>0){
  for(let i=0;i<e.wp.length;i++){
   if(i===e.cur||!e.wp[i])continue;
   const od=wdef(e.wp[i]);
   if(od.e.barrier)continue;
   if(od.t==='m'||(od.am||0)<=e.ammo){e.cur=i;return{d:od,w:e.wp[i]};}
  }
  return{d:BARE,w:null};
 }
 if(d.t==='r'&&(d.am||0)>0&&e.ammo<(d.am||0)){
  const o=e.wp[1-e.cur];
  if(o){const od=wdef(o);if(od.t==='m'||(od.am||0)<=e.ammo){e.cur=1-e.cur;return{d:od,w:o};}}
  return{d:BARE,w:null};
 }
 return{d,w};
}
function fire(e,forced){
 if(e.cool>0||e.stun>0)return;
 const u=usableDef(e),d=u.d,w=u.w;
 if(d.e.barrier&&e.bladeCd>0){if(e===player&&Math.random()<0.1)addText(e.x,e.y-30,'使用不能 '+(e.bladeCd/1000).toFixed(1)+'秒','#ff8a8a');return;}
 const dm=w?wdmg(w):BARE.d;
 if(d.t==='m'){
  e.cool=d.cd;e.swing=1;e.swingT=180;
  meleeHit(e,d,dm,w);
  return;
 }
 const cost=d.am||0;
 if(cost>0&&e.ammo<cost)return;
 e.ammo-=cost;e.cool=d.cd;
 let mult=1,spd=d.sp;
 if(d.e.charge){const c=clamp(e.charge/900,0,1);mult=1+c*1.6;spd*=1+c*0.6;e.charge=0;}
 const n=d.cnt||1;
 for(let i=0;i<n;i++){
  const a=e.ang+rnd(-d.sprd,d.sprd);
  spawnBullet(e,a,dm*mult,d,spd,w);
 }
 if(d.e.rail){
  shake(14);addFx(e.x+Math.cos(e.ang)*30,e.y+Math.sin(e.ang)*30,'#7fd8ff',18,6,400,3);
  // 雷霧の巨兵の技：壁も段差も無視して狙った地点に落雷
  const ap=aimPoint(e,d.rng);
  for(let i=0;i<3;i++){
   const px=i===0?ap.x:ap.x+rnd(-170,170),py=i===0?ap.y:ap.y+rnd(-170,170);
   thunderStrike(px,py,e,58,3,850+i*140,150);
  }
 }
 if(d.e.heal)heal(e,d.e.heal);
 if(d.e.burst){e.burstN=2;e.burstT=70;e.burstA=e.ang;}
}
function spawnBullet(o,a,dm,d,spd,w){
 const far=player?Math.hypot(o.x-player.x,o.y-player.y)>1500:false;
 if(far&&o.bot)return;
 bullets.push({
  x:o.x+Math.cos(a)*16,y:o.y+Math.sin(a)*16,
  vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
  dm:dm*(o.bot?0.75:1),o:o,lvl:o.lvl,life:(d.rng/spd),
  e:d.e,col:w?wcol(w):'#9ff',sz:d.e.rail?9:(d.e.aoe?5:3),
  pierce:d.e.pierce||0,bounce:d.e.bounce||0,homing:d.e.homing||0,
  ang:a,rail:d.e.rail||0,sashimi:d.e.sashimi||0,split:d.e.split||0
 });
}
function meleeHit(e,d,dm,w){
 const rc=d.rc,reach=rc+e.r;
 const arc=d.e.pierceM?0.28:0.95;
 const hits=[];
 for(const t of ents){
  if(t===e||!t.alive)continue;
  const dx=t.x-e.x,dy=t.y-e.y,dd=Math.hypot(dx,dy);
  if(dd>reach)continue;
  if(Math.abs(angDiff(Math.atan2(dy,dx),e.ang))>arc)continue;
  if(t.lvl!==e.lvl&&dd>72)continue;
  hits.push(t);
 }
 for(const b of bossList){
  if(!b.alive)continue;
  const dd=Math.hypot(b.x-e.x,b.y-e.y);
  if(dd<reach+b.r&&Math.abs(angDiff(Math.atan2(b.y-e.y,b.x-e.x),e.ang))<arc+0.4)hits.push(b);
 }
 for(const c of chests){
  if(c.op)continue;
  const dd=Math.hypot(c.x-e.x,c.y-e.y);
  if(dd<reach+14&&Math.abs(angDiff(Math.atan2(c.y-e.y,c.x-e.x),e.ang))<arc+0.5)damageChest(c,dm*(d.e.breaker||1)*(e.ch.id==='min'?3:1),e);
 }
 const mult=(d.e.multi||1);
 let total=0;
 for(const t of hits.slice(0,d.e.pierceM?9:(d.e.aoe?9:3))){
  let dd=dm*(e.bot?0.75:1);
  if(e.blade)dd*=4;
  if(d.e.crit&&Math.random()<0.22)dd*=d.e.crit;
  for(let m=0;m<mult;m++)hurt(t,dd,e,d.e);
  total+=dd*mult;
  if(d.e.knock)knock(t,e,d.e.knock);
  if(d.e.pull)knock(t,e,-d.e.pull);
  if(d.e.chain)chainTo(e,t,dd*0.5,d.e.chain,d.e);
 }
 if(d.e.life&&total>0)heal(e,total*d.e.life);
 if(d.e.guard)e.guard=Math.min(120,e.guard+d.e.guard);
 if(d.e.aoe){
  const ax=e.x+Math.cos(e.ang)*rc*0.7,ay=e.y+Math.sin(e.ang)*rc*0.7;
  aoeHit(ax,ay,d.e.aoe,dm*0.5*(e.blade?4:1),e,d.e);
  addFx(ax,ay,w?wcol(w):'#fff',10,3,300,3);
 }
 if(d.e.barrier){
  const bx=e.x+Math.cos(e.ang)*rc,by=e.y+Math.sin(e.ang)*rc;
  barriers.push({x:bx,y:by,r:90,l:6000,ml:6000,owner:e.id});
  addFx(bx,by,'#7be0c0',16,3,400,3);
  if(e.blade){
   // 纏っている間はバリアの斬撃を飛ばせる（基礎攻撃力の3.5倍）
   bullets.push({x:e.x+Math.cos(e.ang)*30,y:e.y+Math.sin(e.ang)*30,
    vx:Math.cos(e.ang)*13,vy:Math.sin(e.ang)*13,dm:dm*3.5*(e.bot?0.75:1),o:e,lvl:e.lvl,life:52,
    e:{knock:8,aoe:70},col:'#7be0c0',sz:13,pierce:3,bounce:0,homing:0,ang:e.ang,split:0,slash:1});
  }
 }
 if(d.e.elem){elemBurst(e,dm);}
 if(d.e.sun&&e.sun<=0){
  e.sun=4000;
  for(const t of ents){if(t!==e&&t.alive&&Math.hypot(t.x-e.x,t.y-e.y)<320&&Math.abs(angDiff(Math.atan2(t.y-e.y,t.x-e.x),e.ang))<0.7){t.stun=Math.max(t.stun,1100);addText(t.x,t.y-24,'まぶしい!','#ffe9a0');}}
  addFx(e.x+Math.cos(e.ang)*50,e.y+Math.sin(e.ang)*50,'#fff3b0',18,4,500,4);
 }
 // 斬撃エフェクト
 if(!e.bot||Math.hypot(e.x-player.x,e.y-player.y)<900)
  fx.push({slash:1,x:e.x,y:e.y,a:e.ang,rc:reach,l:200,ml:200,c:w?wcol(w):'#fff',arc:arc});
}
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d;};
function knock(t,src,v){
 const a=Math.atan2(t.y-src.y,t.x-src.x);
 t.kx=(t.kx||0)+Math.cos(a)*v;t.ky=(t.ky||0)+Math.sin(a)*v;
}
function heal(e,v){e.hp=Math.min(e.max,e.hp+v);addText(e.x,e.y-20,'+'+Math.round(v),'#7CFFB2');}
function aoeHit(x,y,r,dm,src,eff){
 for(const t of ents){if(t.alive&&t!==src){const d=Math.hypot(t.x-x,t.y-y);if(d<r)hurt(t,dm*(1-d/r*0.5),src,eff);}}
 for(const b of bossList){if(b.alive&&b!==src){const d=Math.hypot(b.x-x,b.y-y);if(d<r+b.r)hurt(b,dm*(1-clamp(d/(r+b.r),0,1)*0.5),src,eff);}}
 for(const c of chests){if(!c.op&&Math.hypot(c.x-x,c.y-y)<r)damageChest(c,dm,src);}
}
function chainTo(src,from,dm,n,eff){
 let cur=from,used=[from];
 for(let i=0;i<n;i++){
  let best=null,bd=260;
  for(const t of ents){if(t.alive&&t!==src&&used.indexOf(t)<0){const d=Math.hypot(t.x-cur.x,t.y-cur.y);if(d<bd){bd=d;best=t;}}}
  if(!best)break;
  fx.push({line:1,x1:cur.x,y1:cur.y,x2:best.x,y2:best.y,l:180,ml:180,c:'#9fe8ff'});
  hurt(best,dm,src,eff);used.push(best);cur=best;
 }
}
function elemBurst(e,dm){
 const el=e.elem;
 const ap=aimPoint(e,520);
 if(el===0){
  // 火：炎の海（四神の化身と同じ仕組み）
  for(let i=0;i<3;i++){
   const px=i===0?ap.x:ap.x+rnd(-140,140),py=i===0?ap.y:ap.y+rnd(-140,140);
   hazards.push({x:px,y:py,r:92,l:6000,dmg:10,burn:4,o:e,c:'#ff8a3d'});
   addFx(px,py,'#ff8a3d',14,4,600,4);
  }
 }
 if(el===1){
  // 雷：狙った方向へステージの端まで、壁も段差も無視して落雷（10秒スタン）
  const a=Math.atan2(ap.y-e.y,ap.x-e.x);
  let n=0;
  for(let d=140;d<9000;d+=190){
   const px=e.x+Math.cos(a)*d,py=e.y+Math.sin(a)*d;
   if(px<TS||py<TS||px>WW-TS||py>WH-TS)break;
   thunderStrike(px,py,e,dm*0.55,10,420+n*90,120);
   n++;
  }
  addFx(e.x,e.y,'#bfe8ff',16,5,400,4);
 }
 if(el===2){
  // 水：広範囲に水圧の大ダメージ＋継続ダメージ
  aoeHit(ap.x,ap.y,240,dm*1.4,e,{soak:6,slow:2});
  for(const t of ents)if(t.alive&&t!==e&&Math.hypot(t.x-ap.x,t.y-ap.y)<240)knock(t,e,11);
  addFx(ap.x,ap.y,'#5fc8ff',34,7,700,5);
  for(let k=0;k<10;k++){const aa=Math.random()*TAU;fx.push({line:1,x1:ap.x,y1:ap.y,x2:ap.x+Math.cos(aa)*rnd(80,240),y2:ap.y+Math.sin(aa)*rnd(80,240),l:320,ml:320,c:'#9fe0ff'});}
  shake(10);
 }
 if(el===3){
  // 土：一定時間で消える壁を作る
  const a=Math.atan2(ap.y-e.y,ap.x-e.x)+Math.PI/2;
  const cx=e.x+Math.cos(a-Math.PI/2)*130,cy=e.y+Math.sin(a-Math.PI/2)*130;
  for(let k=-2;k<=2;k++){
   barriers.push({x:cx+Math.cos(a)*k*62,y:cy+Math.sin(a)*k*62,r:40,l:9000,ml:9000,owner:e.id,earth:1});
  }
  addFx(cx,cy,'#c9a15c',22,5,600,4);
 }
}
function damageChest(c,dm,src){
 if(c.op)return;
 c.hp-=dm;c.sh=1;
 addFx(c.x,c.y,'#c8a24a',3,2,240,2);
 if(c.hp<=0){
  c.op=1;
  const n=ri(2,4);
  for(let i=0;i<n;i++){
   const a=Math.random()*TAU,dx=c.x+Math.cos(a)*rnd(8,26),dy=c.y+Math.sin(a)*rnd(8,26);
   const r=Math.random();
   if(r<0.42)dropItem(dx,dy,'w',makeWeapon(ri(0,BASES.length-1),rollRank(c.b)));
   else if(r<0.60)dropItem(dx,dy,'ammo',ri(20,60));
   else if(r<0.74)dropItem(dx,dy,'heal',1);
   else if(r<0.87)dropItem(dx,dy,'food',1);
   else dropItem(dx,dy,'pot',1);
  }
  addFx(c.x,c.y,'#ffd166',18,3,600,3);
  if(src===player)addText(c.x,c.y-24,'宝箱を破壊!','#ffd166');
 }
}

/* ================= UPDATE ================= */
function updateBullets(dt){
 for(let i=bullets.length-1;i>=0;i--){
  const b=bullets[i];
  if(b.homing){
   let best=null,bd=380;
   for(const t of ents){if(t.alive&&t!==b.o){const d=Math.hypot(t.x-b.x,t.y-b.y);if(d<bd){bd=d;best=t;}}}
   if(best){const a=Math.atan2(best.y-b.y,best.x-b.x),s=Math.hypot(b.vx,b.vy);
    const na=b.ang+clamp(angDiff(a,b.ang),-0.09,0.09);b.ang=na;b.vx=Math.cos(na)*s;b.vy=Math.sin(na)*s;}
  }
  const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vy)/12));
  let dead=0;
  for(let s=0;s<steps&&!dead;s++){
   b.x+=b.vx/steps;b.y+=b.vy/steps;
   const t=T(Math.floor(b.x/TS),Math.floor(b.y/TS));
   if(t===WALL||t===ROCK||t===HOUSE||(t===HIGH&&b.lvl===0)){
    if(b.bounce>0){b.bounce--;
     const tx=T(Math.floor((b.x-b.vx/steps)/TS),Math.floor(b.y/TS));
     if(tx===WALL||tx===ROCK||tx===HOUSE||(tx===HIGH&&b.lvl===0))b.vy*=-1;else b.vx*=-1;
     b.x-=b.vx/steps;b.y-=b.vy/steps;
    } else {impact(b);dead=1;break;}
   }
   let hitB=false;
   for(const br of barriers){if(br.owner!==b.o.id&&Math.hypot(br.x-b.x,br.y-b.y)<br.r){impact(b);dead=1;hitB=true;break;}}
   if(hitB)break;
   for(const e of ents){
    if(!e.alive||e===b.o)continue;
    if(Math.abs(e.x-b.x)>40||Math.abs(e.y-b.y)>40)continue;
    if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.sz){
     onHit(b,e);
     if(b.pierce>0){b.pierce--;}else{dead=1;}
     break;
    }
   }
   if(dead)break;
   for(const bs of bossList){
    if(!bs.alive||bs===b.o)continue;
    if(Math.hypot(bs.x-b.x,bs.y-b.y)<bs.r+b.sz){onHit(b,bs);if(b.pierce>0)b.pierce--;else dead=1;break;}
   }
   if(dead)break;
   for(const c of chests){
    if(c.op)continue;
    if(Math.hypot(c.x-b.x,c.y-b.y)<15+b.sz){damageChest(c,b.dm,b.o);impact(b);dead=1;break;}
   }
  }
  b.life-=dt/16;
  if(b.rail&&Math.random()<0.6)fx.push({x:b.x,y:b.y,vx:0,vy:0,l:180,ml:180,c:'#8fe0ff',s:5});
  if(dead||b.life<=0)bullets.splice(i,1);
 }
}
function onHit(b,e){
 let dm=b.dm;
 hurt(e,dm,b.o,b.e);
 if(b.e.knock)knock(e,b.o,b.e.knock);
 if(b.e.pull)knock(e,{x:b.x*2-b.o.x,y:b.y*2-b.o.y},-b.e.pull);
 if(b.e.chain)chainTo(b.o,e,dm*0.55,b.e.chain,b.e);
 if(b.sashimi){
  dropItem(e.x+rnd(-16,16),e.y+rnd(-16,16),'food',ri(1,2));
  addText(e.x,e.y-30,'三枚おろし!','#9fe8ff');
  addFx(e.x,e.y,'#cfe8ff',10,3,400,3);
 }
 impact(b);
}
function impact(b){
 if(b.e.aoe){
  aoeHit(b.x,b.y,b.e.aoe,b.dm*0.85,b.o,b.e);
  addFx(b.x,b.y,b.rail?'#a8e4ff':'#ffb15e',b.rail?46:22,b.rail?9:5,b.rail?800:500,b.rail?5:4);
  if(b.rail){
   shake(26);
   for(let i=0;i<10;i++){const a=Math.random()*TAU;fx.push({line:1,x1:b.x,y1:b.y,x2:b.x+Math.cos(a)*rnd(60,b.e.aoe),y2:b.y+Math.sin(a)*rnd(60,b.e.aoe),l:300,ml:300,c:'#bfefff'});}
  } else shake(b.e.aoe/14);
 } else addFx(b.x,b.y,b.col,4,2,240,2);
 if(b.split>0){
  for(let i=0;i<3;i++){
   const a=Math.random()*TAU;
   bullets.push({x:b.x,y:b.y,vx:Math.cos(a)*9,vy:Math.sin(a)*9,dm:b.dm*0.5,o:b.o,lvl:b.lvl,life:24,e:{},col:b.col,sz:3,pierce:0,bounce:0,homing:0,ang:a,split:b.split-1});
  }
 }
}
function updateEnt(e,dt){
 if(!e.alive)return;
 const far=e!==player&&Math.hypot(e.x-player.x,e.y-player.y)>1500;
 // 状態異常
 if(e.burn>0){e.burn-=dt/1000;e.hp-=dt/1000*4;if(!far&&Math.random()<0.1)addFx(e.x,e.y,'#ff9a3d',1,1,300,2);}
 if(e.poison>0){e.poison-=dt/1000;e.hp-=dt/1000*3;}
 if(e.bleed>0){e.bleed-=dt/1000;e.hp-=dt/1000*3;}
 if(e.soak>0){e.soak-=dt/1000;e.hp-=dt/1000*7;if(Math.random()<0.06)addFx(e.x,e.y,'#5fc8ff',1,1,300,2);}
 if(e.slow>0)e.slow-=dt;
 if(e.stun>0)e.stun-=dt;
 if(e.sun>0)e.sun-=dt;
 if(e.inv>0)e.inv-=dt;
 if(e.dashCd>0)e.dashCd-=dt;
 // バリア纏い：1分使うと10秒間まったく使えなくなる
 if(e.bladeOn){
  e.bladeTime-=dt;
  if(e.bladeTime<=0){e.bladeOn=0;e.bladeTime=0;e.bladeCd=10000;if(e===player)addText(e.x,e.y-34,'纏い終了（10秒使用不能）','#ff8a8a');}
 }
 if(e.bladeCd>0){
  e.bladeCd-=dt;
  if(e.bladeCd<=0){e.bladeCd=0;e.bladeTime=60000;if(e===player)addText(e.x,e.y-34,'バリアブレード復帰','#7be0c0');}
 }
 e.blade=e.bladeOn?1:0;
 if(e.cool>0)e.cool-=dt;
 if(e.flash>0)e.flash-=dt/200;
 if(e.swingT>0)e.swingT-=dt;
 // 空腹
 const drain=(e.ch.id==='hun'?0.5:1)*dt/1000*0.42;
 e.food=Math.max(0,e.food-drain);
 if(e.food<=0){e.hp-=dt/1000*1.6;}
 if(e.god){e.hp=e.max;e.food=100;e.guard=120;e.burn=0;e.poison=0;e.bleed=0;}
 if(e.hp<=0){kill(e,e.lastHit||null);return;}
 // ノックバック
 if(e.kx||e.ky){moveEnt(e,e.kx,e.ky);e.kx*=0.82;e.ky*=0.82;if(Math.abs(e.kx)<0.2)e.kx=0;if(Math.abs(e.ky)<0.2)e.ky=0;}
 // バースト射撃
 if(e.burstN>0){e.burstT-=dt;if(e.burstT<=0){const w=curW(e),d=wdef(w);if(d&&d.t==='r'&&e.ammo>=(d.am||0)){e.ammo-=(d.am||0);spawnBullet(e,e.burstA+rnd(-d.sprd,d.sprd),wdmg(w),d,d.sp,w);}e.burstN--;e.burstT=70;}}
 if(e.bot)botAI(e,dt,far);
 // アイテム自動取得（毎フレーム全ドロップを見ると重いので間引く）
 e.pickT=(e.pickT||0)-dt;
 if((!far||e===player)&&(e===player||e.pickT<=0)){
  if(e!==player)e.pickT=140;
  for(let i=drops.length-1;i>=0;i--){
   const d=drops[i];
   if(d.type==='w')continue;
   if(Math.hypot(d.x-e.x,d.y-e.y)<26&&d.lvl===e.lvl){pickup(e,d);drops.splice(i,1);}
  }
 }
}
function pickup(e,d){
 if(d.type==='ammo'){e.ammo+=d.data;if(e===player)addText(e.x,e.y-26,'弾薬+'+d.data,'#cfe8ff');}
 if(d.type==='heal'){e.items.heal+=d.data;if(e===player)addText(e.x,e.y-26,'回復+'+d.data,'#7CFFB2');}
 if(d.type==='food'){e.items.food+=d.data;if(e===player)addText(e.x,e.y-26,'食料+'+d.data,'#ffd9a0');}
 if(d.type==='pot'){e.items.pot+=d.data;if(e===player)addText(e.x,e.y-26,'ポーション+'+d.data,'#a8b8ff');}
}
function takeWeapon(e,w){
 let put=-1;
 for(let i=0;i<e.wp.length;i++)if(!e.wp[i]){put=i;break;}
 if(put>=0)e.wp[put]=w;
 else{
  const cw=e.wp[e.cur];
  if(cw)dropItem(e.x+rnd(-10,10),e.y+rnd(-10,10),'w',cw);
  e.wp[e.cur]=w;
 }
 if(e===player)addText(e.x,e.y-30,w.n,rankColor(w.r));
}

/* ---------- CPU AI ---------- */
function botAI(e,dt,far){
 e.think-=dt;
 e.aggr=clamp(gt/210000,0,1);
 if(e.stun>0)return;
 const rush=(e.aggr>=1&&e.tgt&&Math.hypot(e.tgt.x-e.x,e.tgt.y-e.y)>700)?1.4:1;
 const spd=(1.55*e.ch.spd)*rush*(e.slow>0?0.55:1)*(e.food<=0?0.6:1)*(far?0.75:1)*dt/16;
 // 目標選定
 e.stuckT=(e.stuckT||0)+dt;
 if(e.stuckT>1400){
  const moved=Math.hypot(e.x-(e.lx||0),e.y-(e.ly||0));
  if(moved<26){
   e.stuckN=(e.stuckN||0)+1;
   if(e.stuckN>=2&&stairsList.length){
    let bs=null,bd2=1e9;
    for(const st of stairsList){const dd2=Math.hypot(st.x-e.x,st.y-e.y);if(dd2<bd2){bd2=dd2;bs=st;}}
    if(bs){e.tx=bs.x;e.ty=bs.y;}
    e.stuckN=0;
   } else {const p=freeSpot();e.tx=p.x;e.ty=p.y;}
   e.tgt=null;e.chestT=null;e.wander=-(e.wander||1);
   e.detourT=gt+1700;e.detourA=Math.random()*TAU;
  } else e.stuckN=0;
  e.lx=e.x;e.ly=e.y;e.stuckT=0;
 }
 if(e.think<=0){
  e.think=rnd(300,700);
  let best=null,bd=e.aggr>=1?1e9:(240+e.aggr*1700);
  for(const t of ents){
   if(!t.alive||t===e)continue;
   const d=Math.hypot(t.x-e.x,t.y-e.y);
   if(d<bd){bd=d;best=t;}
  }
  e.tgt=best;
  if(!best||bd>380){
   let bc=null,cd2=900;
   for(const c of chests){if(c.op)continue;const d=Math.hypot(c.x-e.x,c.y-e.y);if(d<cd2){cd2=d;bc=c;}}
   e.chestT=bc;
  } else e.chestT=null;
  if(!e.tgt&&!e.chestT&&Math.hypot(e.tx-e.x,e.ty-e.y)<80){
   const p=freeSpot();e.tx=p.x;e.ty=p.y;
  }
  // ボスに挑む
  if(Math.random()<0.02){for(const b of bossList){if(b.alive&&Math.hypot(b.x-e.x,b.y-e.y)<700){e.bossT=b;break;}}}
 }
 // 回復/食事
 if(e.hp<e.max*0.55&&e.items.heal>0&&e.cool<=0){e.items.heal--;heal(e,42);e.cool=600;}
 if(e.hp<e.max*0.3&&e.items.heal<=0){if(!e.fleeT)e.fleeT=gt+2600;}else e.fleeT=0;
 e.flee=(e.fleeT&&gt<e.fleeT)?1:0;
 if(e.food<28&&e.items.food>0){e.items.food--;e.food=Math.min(100,e.food+55);}
 if(e.guard<12&&e.items.pot>0){e.items.pot--;e.guard=Math.min(120,e.guard+55);}
 const u=usableDef(e),d=u.d,w=u.w;
 const dmg0=w?wdmg(w):BARE.d;
 if(d.e.barrier&&e.bladeCd<=0&&e.bladeTime>0)e.bladeOn=1;
 let tx=e.tx,ty=e.ty,attack=false;
 const boss=e.bossT&&e.bossT.alive?e.bossT:null;
 const target=e.tgt&&e.tgt.alive?e.tgt:boss;
 if(target){
  const dd=Math.hypot(target.x-e.x,target.y-e.y);
  e.ang=Math.atan2(target.y-e.y,target.x-e.x)+rnd(-0.09,0.09);
  const want=e.flee>0?900:(d.t==='m'?(d.rc*0.7):clamp(d.rng*0.45,120,420));
  if(dd>want){tx=target.x;ty=target.y;}
  else if(dd<want*0.6){tx=e.x-(target.x-e.x);ty=e.y-(target.y-e.y);}
  else{const a=Math.atan2(target.y-e.y,target.x-e.x)+Math.PI/2*(e.strafe||1);tx=e.x+Math.cos(a)*90;ty=e.y+Math.sin(a)*90;if(Math.random()<0.02)e.strafe=-(e.strafe||1);}
  const reach=d.t==='m'?d.rc+22:d.rng*0.95;
  if(dd<reach&&(target.lvl===e.lvl||target.boss||d.t==='m'===false)){
   if(far){
    // 遠方は簡易処理(弾を出さずに判定)。近距離でしか当たらない
    const ar=d.t==='m'?d.rc+34:Math.min(d.rng*0.6,560);
    if(e.cool<=0&&dd<ar){e.cool=d.cd;if(Math.random()<0.3)hurt(target,dmg0*0.55,e,d.e);}
    else if(e.cool<=0)e.cool=d.cd;
   } else attack=true;
  }
 } else if(e.chestT&&!e.chestT.op){
  const c=e.chestT,dd=Math.hypot(c.x-e.x,c.y-e.y);
  e.ang=Math.atan2(c.y-e.y,c.x-e.x);
  tx=c.x;ty=c.y;
  if(dd<(d.t==='m'?d.rc+20:220)){
   if(far){if(e.cool<=0){e.cool=d.cd;damageChest(c,dmg0,e);}}else attack=true;
  }
 } else {
  e.ang=Math.atan2(ty-e.y,tx-e.x);
 }
 // 武器ドロップ拾い(近い時のみ・間引く)
 e.wpickT=(e.wpickT||0)-dt;
 if(!far&&e.wpickT<=0){
  e.wpickT=200;
  for(let i=drops.length-1;i>=0;i--){
   const dr=drops[i];
   if(dr.type!=='w')continue;
   if(Math.hypot(dr.x-e.x,dr.y-e.y)<28){
    const cw=curW(e);
    const better=!cw||wdmg(dr.data)*(1000/wdef(dr.data).cd)>wdmg(cw)*(1000/wdef(cw).cd)*1.05||(wdef(cw).t==='r'&&e.ammo<3&&wdef(dr.data).t==='m');
    if(better||!e.wp[1]){takeWeapon(e,dr.data);drops.splice(i,1);}
   }
  }
 }
 if(attack)fire(e);
 // 残り少人数のときだけ、壁を回り込む経路を計算して確実に出会わせる
 if(alive<=6&&target&&!e.flee){
  e.pathT=(e.pathT||0)-dt;
  if(e.pathT<=0){
   e.pathT=1200;
   e.path=pathStep(e.x,e.y,target.x,target.y);
  }
  if(e.path&&Math.hypot(target.x-e.x,target.y-e.y)>170){tx=e.path.x;ty=e.path.y;}
 }
 if(e.detourT&&gt<e.detourT){tx=e.x+Math.cos(e.detourA)*320;ty=e.y+Math.sin(e.detourA)*320;}
 // 移動
 const a=Math.atan2(ty-e.y,tx-e.x);
 let dx=Math.cos(a)*spd,dy=Math.sin(a)*spd;
 if(!tileFree(e,e.x+dx*3,e.y+dy*3,e.r)){
  const alt=a+(e.wander||1)*1.3;
  dx=Math.cos(alt)*spd;dy=Math.sin(alt)*spd;
  if(Math.random()<0.03)e.wander=-(e.wander||1);
 }
 moveEnt(e,dx,dy);
}

/* ---------- 落雷（壁・段差を無視する） ---------- */
function thunderStrike(x,y,src,dmg,stunSec,delay,r,frac){
 // frac を渡すと、相手の最大体力に対する割合でダメージを決める
 strikes.push({x,y,o:src,dmg,stun:stunSec,t:delay||900,r:r||150,frac:frac||0});
}
function updateStrikes(dt){
 for(let i=strikes.length-1;i>=0;i--){
  const m=strikes[i];m.t-=dt;
  if(m.t>0)continue;
  // 壁や段差に関係なく、円の中の全員に当たる
  for(const e of ents){
   if(!e.alive||e===m.o)continue;
   if(Math.hypot(e.x-m.x,e.y-m.y)>=m.r)continue;
   hurt(e,m.frac?e.max*m.frac:m.dmg,m.o,{stun:m.stun});
  }
  for(const b of bossList){if(b.alive&&b!==m.o&&Math.hypot(b.x-m.x,b.y-m.y)<m.r+b.r)hurt(b,m.dmg,m.o,{stun:m.stun});}
  for(const c of chests){if(!c.op&&Math.hypot(c.x-m.x,c.y-m.y)<m.r)damageChest(c,m.dmg,m.o);}
  addFx(m.x,m.y,'#bfe8ff',26,7,700,5);
  for(let k=0;k<7;k++){const a=Math.random()*TAU;fx.push({line:1,x1:m.x,y1:m.y-300,x2:m.x+Math.cos(a)*rnd(30,m.r),y2:m.y+Math.sin(a)*rnd(30,m.r),l:280,ml:280,c:'#dff2ff'});}
  if(player&&Math.hypot(m.x-player.x,m.y-player.y)<900)shake(10);
  strikes.splice(i,1);
 }
}
// 狙っている地点（プレイヤーは照準、CPUは狙っている相手）
function aimPoint(e,maxd){
 // 向きは必ず e.ang（＝プレイヤーは照準の方向）。距離だけカーソルや相手から決める
 let d=maxd;
 if(e===player){
  const dd=Math.hypot(cam.x+mouse.x-e.x,cam.y+mouse.y-e.y);
  if(dd>40)d=Math.min(maxd,dd);
 } else if(e.tgt&&e.tgt.alive){
  d=clamp(Math.hypot(e.tgt.x-e.x,e.tgt.y-e.y),60,maxd);
 }
 return{x:e.x+Math.cos(e.ang)*d,y:e.y+Math.sin(e.ang)*d};
}
/* ---------- 危険地帯（炎の海など） ---------- */
function updateHazards(dt){
 updateStrikes(dt);
 for(let i=hazards.length-1;i>=0;i--){
  const h=hazards[i];
  h.l-=dt;
  h.tick=(h.tick||0)+dt;
  if(h.tick>=200){
   h.tick=0;
   for(const e of ents){
    if(!e.alive||e===h.o)continue;
    if(Math.hypot(e.x-h.x,e.y-h.y)<h.r)hurt(e,h.dmg,h.o,{burn:h.burn||0});
   }
  }
  if(!player||Math.hypot(h.x-player.x,h.y-player.y)<1200){
   if(Math.random()<0.25)fx.push({x:h.x+rnd(-h.r,h.r),y:h.y+rnd(-h.r,h.r),vx:0,vy:-0.6,l:500,ml:500,c:h.c,s:4});
  }
  if(h.l<=0)hazards.splice(i,1);
 }
 // 消えた分身を配列から除く
 for(let i=bossList.length-1;i>=0;i--)if(bossList[i].clone&&!bossList[i].alive)bossList.splice(i,1);
}
/* ---------- ボス ---------- */
function updateBoss(b,dt){
 if(!b.alive)return;
 if(b.inv>0)b.inv-=dt;
 b.hit=Math.max(0,(b.hit||0)-dt/200);
 if(b.clone){b.life-=dt;if(b.life<=0){b.alive=0;addFx(b.x,b.y,b.def.col,20,4,500,3);return;}}
 const far=Math.hypot(b.x-player.x,b.y-player.y)>1400;
 let tgt=null,bd=680;
 for(const t of ents){if(t.alive){const d=Math.hypot(t.x-b.x,t.y-b.y);if(d<bd){bd=d;tgt=t;}}}
 b.tgt=tgt;
 if(!tgt){b.beamT=0;b.beamWarn=0;return;}
 b.abCd-=dt;
 // チャンスタイム：特殊技の直後10秒はいっさい行動しない（30秒周期の最初の10秒）
 if(b.rest>0){
  b.rest-=dt;
  b.beamT=0;b.beamWarn=0;b.beamCd=Math.max(b.beamCd,1200);
  if(!far&&Math.random()<0.08)addFx(b.x+rnd(-b.r,b.r),b.y+rnd(-b.r,b.r),'#ffd166',1,1,500,3);
  return;
 }
 const hpr=b.hp/b.max;
 b.phase=hpr<0.4?1:0;
 // ---- 継続ダメージビーム ----
 b.beamCd-=dt;
 if(b.beamCd<=0&&b.beamT<=0&&b.beamWarn<=0&&bd<640){
  b.beamWarn=900;b.beamAng=Math.atan2(tgt.y-b.y,tgt.x-b.x);
 }
 if(b.beamWarn>0){
  b.beamWarn-=dt;
  // 予告が出た時点で方向は決定。以降いっさい動かさない
  if(b.beamWarn<=0){b.beamT=b.phase?3400:2600;b.beamTick=0;if(!far)shake(6);}
 } else if(b.beamT>0){
  b.beamT-=dt;
  // 照射が始まったら角度は固定（狙いを定めるのは予告の0.9秒だけ）
  // 壁で止まる長さを求める
  let len=0;
  for(let d=b.r;d<900;d+=12){
   const bx=b.x+Math.cos(b.beamAng)*d,by=b.y+Math.sin(b.beamAng)*d;
   const t2=T(Math.floor(bx/TS),Math.floor(by/TS));
   if(t2===WALL||t2===ROCK||t2===HOUSE)break;
   len=d;
  }
  b.beamLen=len;
  b.beamTick-=dt;
  if(b.beamTick<=0){
   b.beamTick=150;
   for(const e of ents){
    if(!e.alive)continue;
    const dx=e.x-b.x,dy=e.y-b.y;
    const proj=dx*Math.cos(b.beamAng)+dy*Math.sin(b.beamAng);
    if(proj<b.r-10||proj>len+20)continue;
    const side=-dx*Math.sin(b.beamAng)+dy*Math.cos(b.beamAng);
    const perp=Math.abs(side);
    if(perp<24+e.r*0.5){
     hurt(e,b.phase?13:9,b,{burn:2});
     // 当たっている間は横へ押し出す。スタン中でも必ず抜け出せるようにするため
     const sg=side>=0?1:-1, pa=b.beamAng+Math.PI/2;
     e.kx=(e.kx||0)+Math.cos(pa)*sg*6;
     e.ky=(e.ky||0)+Math.sin(pa)*sg*6;
     if(e===player)addFx(e.x,e.y,'#ffd9a0',3,2,300,2);
    }
   }
   if(!far)addFx(b.x+Math.cos(b.beamAng)*len,b.y+Math.sin(b.beamAng)*len,b.def.col,4,3,300,3);
  }
  if(b.beamT<=0)b.beamCd=b.phase?5200:8000;
 }
 // ---- 特殊能力 ----
 if(b.abCd<=0&&!b.clone&&bd<700){
  b.abCd=30000;                 // 特殊技は必ず30秒に1回
  bossAbility(b,tgt,far);
  b.rest=10000;                 // 直後の10秒は完全に無防備（チャンスタイム）
  b.beamT=0;b.beamWarn=0;
  if(!far)addText(b.x,b.y-b.r-30,'チャンスタイム！','#ffd166');
  return;                       // 発動したフレームはもう動かない
 }
 // ---- 移動と通常攻撃 ----
 b.ang=b.beamT>0?b.beamAng:Math.atan2(tgt.y-b.y,tgt.x-b.x);
 const rush=b.def.ab==='clone'?1.7:1;
 const spd=(0.75+(b.phase?0.5:0))*rush*dt/16;
 // ビーム照射中は足を止める（狙いだけはゆっくり追う）
 if(b.beamT<=0&&bd>90){
  const ma=Math.atan2(tgt.y-b.y,tgt.x-b.x);
  b.x+=Math.cos(ma)*spd;b.y+=Math.sin(ma)*spd;
 }
 const lim=b.clone?TS*16:TS*12;
 const hd=Math.hypot(b.x-b.hx,b.y-b.hy);
 if(hd>lim){const ha=Math.atan2(b.y-b.hy,b.x-b.hx);b.x=b.hx+Math.cos(ha)*lim;b.y=b.hy+Math.sin(ha)*lim;}
 b.at-=dt;b.at2-=dt;
 if(b.at<=0&&b.beamT<=0){
  b.at=b.phase?1500:2400;
  const n=b.clone?6:(b.phase?18:12);
  for(let i=0;i<n;i++){
   const a=i/n*TAU+gt/900;
   if(!far)bullets.push({x:b.x+Math.cos(a)*(b.r+10),y:b.y+Math.sin(a)*(b.r+10),vx:Math.cos(a)*6.5,vy:Math.sin(a)*6.5,dm:b.clone?9:16,o:b,lvl:0,life:80,e:{},col:b.def.col,sz:6,pierce:0,bounce:0,homing:0,ang:a});
  }
  if(!far)addFx(b.x,b.y,b.def.col,16,4,500,4);
 }
 if(b.at2<=0&&bd<160){
  b.at2=2000;
  aoeHit(b.x,b.y,150,b.clone?14:26,b,{knock:10});
  addFx(b.x,b.y,b.def.col,24,6,600,5);
  if(!far)shake(10);
 }
}
function bossAbility(b,tgt,far){
 const ab=b.def.ab;
 if(ab==='clone'){
  // 神速の帝王鷹：分身
  const live=bossList.filter(c=>c.clone&&c.alive&&c.pi===b.i).length;
  if(live>=3)return;
  const n=b.phase?3:2;
  for(let i=0;i<n&&live+i<3;i++){
   const a=Math.random()*TAU,dd=rnd(90,170);
   bossList.push({boss:1,clone:1,pi:b.i,id:'clone'+Math.random(),x:b.x+Math.cos(a)*dd,y:b.y+Math.sin(a)*dd,
    hx:b.hx,hy:b.hy,hp:520,max:520,r:30,def:b.def,ang:0,alive:1,at:600,at2:1200,tgt:null,hit:0,lvl:0,phase:0,
    name:b.def.n+'の分身',inv:0,rest:0,beamCd:1e9,beamWarn:0,beamT:0,beamAng:0,beamLen:0,beamTick:0,abCd:1e9,marks:[],life:14000});
   addFx(b.x,b.y,b.def.col,18,5,500,4);
  }
  addFeed('『'+b.def.n+'』が分身した','#ffd06a');
 }
 else if(ab==='thunder'){
  // 雷霧の巨兵：予告してから落雷（ダメージ＋3秒スタン）
  const n=b.phase?4:3;
  for(let i=0;i<n;i++){
   const px=i===0?tgt.x:tgt.x+rnd(-220,220),py=i===0?tgt.y:tgt.y+rnd(-220,220);
   thunderStrike(px,py,b,46,3,1000,150,2/3);
  }
  if(!far)addFx(b.x,b.y,'#bfe8ff',20,5,500,4);
 }
 else if(ab==='barrier'){
  // 蒼盾の守護者：自分の周囲にバリアを展開
  const n=b.phase?7:5;
  for(let i=0;i<n;i++){
   const a=i/n*TAU+gt/2000;
   barriers.push({x:b.x+Math.cos(a)*150,y:b.y+Math.sin(a)*150,r:52,l:8000,ml:8000,owner:b.id});
  }
  addFx(b.x,b.y,'#7be0c0',22,4,600,4);
 }
 else if(ab==='fire'){
  // 四神の化身：炎の海
  const n=b.phase?5:3;
  for(let i=0;i<n;i++){
   const px=i===0?tgt.x:tgt.x+rnd(-200,200),py=i===0?tgt.y:tgt.y+rnd(-200,200);
   hazards.push({x:px,y:py,r:95,l:7000,dmg:9,burn:3,o:b,c:'#ff8a3d'});
   addFx(px,py,'#ff8a3d',16,4,600,4);
  }
  aoeHit(b.x,b.y,190,18,b,{burn:8});
 }
}
function bossDie(b,src){
 b.alive=0;
 if(b.clone){addFx(b.x,b.y,b.def.col,26,5,600,4);return;}
 addFx(b.x,b.y,b.def.col,70,8,1400,6);shake(24);
 dropItem(b.x,b.y-24,'w',makeSpecial(b.def.drop));
 for(let i=0;i<4;i++)dropItem(b.x+rnd(-60,60),b.y+rnd(-60,60),'ammo',ri(40,90));
 for(let i=0;i<3;i++)dropItem(b.x+rnd(-60,60),b.y+rnd(-60,60),'heal',1);
 for(let i=0;i<2;i++)dropItem(b.x+rnd(-60,60),b.y+rnd(-60,60),'pot',1);
 for(let i=0;i<3;i++)dropItem(b.x+rnd(-60,60),b.y+rnd(-60,60),'food',1);
 addFeed('『'+b.def.n+'』撃破 ▸ '+SP[b.def.drop].n+' を落とした','#ffd166');
}

/* ================= INPUT ================= */
const keys={};let mouse={x:0,y:0,down:0,rdown:0};
let cam={x:0,y:0,sh:0};
let cv,ctx,W=0,H=0;
addEventListener('keydown',e=>{
 keys[e.code]=1;
 if(e.code.indexOf('Digit')===0||['Space','KeyQ','KeyE','KeyF','KeyG','KeyX','Tab'].indexOf(e.code)>=0)e.preventDefault();
 if(!started||gameOver)return;
 if(e.code.indexOf('Digit')===0){
  const n=+e.code.slice(5);
  const idx=(n===0?9:n-1);          // 0キーは10番スロット
  if(idx<player.wp.length){player.cur=idx;player.charge=0;}
 }
 if(e.code==='KeyQ'){
  const n=player.wp.length;
  for(let k=1;k<=n;k++){const i=(player.cur+k)%n;if(player.wp[i]){player.cur=i;break;}}
  player.charge=0;
 }
 if(e.code==='Space'&&!e.repeat)dash(player);
 if(e.code==='KeyE')interact();
 if(e.code==='KeyF')useFood();
 if(e.code==='KeyG')usePot();
 if(e.code==='KeyR')useHeal();
 if(e.code==='KeyX'){
  const w=curW(player);
  if(w&&wdef(w).e.barrier){
   if(player.bladeCd>0){
    addText(player.x,player.y-34,'クールタイム中 '+(player.bladeCd/1000).toFixed(1)+'秒','#ff8a8a');
   } else if(player.bladeOn){
    player.bladeOn=0;player.bladeTime=0;player.bladeCd=10000;
    addText(player.x,player.y-34,'纏い解除（10秒使用不能）','#ff8a8a');
   } else {
    player.bladeOn=1;
    addText(player.x,player.y-34,'バリア纏い ON（攻撃力4倍）','#7be0c0');
    addFx(player.x,player.y,'#7be0c0',18,4,500,4);
   }
  } else if(w&&wdef(w).e.elem){
   player.elem=(player.elem+1)%4;
   addText(player.x,player.y-34,['火','雷','水','土'][player.elem],'#9fe8ff');
  }
 }
 if(e.code==='KeyM')mapOpen=!mapOpen;
});
addEventListener('keyup',e=>{keys[e.code]=0;});
function bindCanvas(){
 cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
 cv.addEventListener('mousedown',e=>{if(e.button===0)mouse.down=1;if(e.button===2){mouse.rdown=1;}});
 addEventListener('mouseup',e=>{if(e.button===0){mouse.down=0;releaseCharge();}if(e.button===2)mouse.rdown=0;});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 // タッチ
 let stickId=null,fireId=null;
 cv.addEventListener('touchstart',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
   const r0=cv.getBoundingClientRect();
   if(dashBtn.r&&Math.hypot(t.clientX-r0.left-dashBtn.x,t.clientY-r0.top-dashBtn.y)<dashBtn.r){dash(player);continue;}
   if(t.clientX<innerWidth*0.45&&stickId===null){stickId=t.identifier;stick.on=1;stick.ox=t.clientX;stick.oy=t.clientY;stick.x=0;stick.y=0;}
   else if(fireId===null){fireId=t.identifier;mouse.down=1;aimTouch(t);}
  }
 },{passive:false});
 cv.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
   if(t.identifier===stickId){stick.x=clamp((t.clientX-stick.ox)/60,-1,1);stick.y=clamp((t.clientY-stick.oy)/60,-1,1);}
   if(t.identifier===fireId)aimTouch(t);
  }
 },{passive:false});
 cv.addEventListener('touchend',e=>{
  for(const t of e.changedTouches){
   if(t.identifier===stickId){stickId=null;stick.on=0;stick.x=0;stick.y=0;}
   if(t.identifier===fireId){fireId=null;mouse.down=0;releaseCharge();}
  }
 });
}
const stick={on:0,x:0,y:0,ox:0,oy:0};
let dashBtn={x:0,y:0,r:0};
function aimTouch(t){
 const r=cv.getBoundingClientRect();
 mouse.x=t.clientX-r.left;mouse.y=t.clientY-r.top;
 // オートエイム補助
 let best=null,bd=560;
 for(const en of ents){if(en.alive&&en!==player){const d=Math.hypot(en.x-player.x,en.y-player.y);if(d<bd&&en.lvl===player.lvl){bd=d;best=en;}}}
 if(best)player.aimLock=best;else player.aimLock=null;
}
function releaseCharge(){
 if(!player||!player.alive)return;
 const w=curW(player);if(!w)return;
 if(wdef(w).e.charge&&player.charging){fire(player);player.charging=0;}
 player.charge=0;
}
/* ---------- 緊急回避 ----------
   宝箱5つ分だけ前に跳ぶ。食料を10消費する。
   途中に壁があれば、宝箱0.18個分だけ手前を空けて止まる。 */
const CHEST_UNIT=26;                 // 宝箱1つ分の幅(px)
const DASH_DIST=CHEST_UNIT*5;        // 130px
const DASH_GAP=CHEST_UNIT*0.18;      // 約4.7px
function dash(e){
 if(e.dashCd>0)return;
 if(e.food<10){if(e===player)addText(e.x,e.y-30,'食料が足りない','#ff8a8a');return;}
 if(e.stun>0)return;
 e.food-=10;e.dashCd=250;
 const dx=Math.cos(e.ang),dy=Math.sin(e.ang);
 const sx=e.x,sy=e.y;
 let moved=0,blocked=false;
 while(moved<DASH_DIST){
  const nx=e.x+dx,ny=e.y+dy;
  if(!tileFree(e,nx,ny,e.r)){blocked=true;break;}
  e.x=nx;e.y=ny;moved++;
  const tt=T(Math.floor(e.x/TS),Math.floor(e.y/TS));
  if(tt===HIGH)e.lvl=1;else if(tt===FLOOR||tt===ROCK)e.lvl=0;
  e.onStair=(tt===STAIR);
 }
 if(blocked){
  // 壁にめり込まないよう、宝箱0.18個分だけ下がる
  let back=0;
  while(back<DASH_GAP&&moved>0){
   const nx=e.x-dx,ny=e.y-dy;
   if(!tileFree(e,nx,ny,e.r))break;
   e.x=nx;e.y=ny;back++;moved--;
  }
 }
 // 残像
 for(let k=0;k<7;k++){
  const p=k/7;
  fx.push({x:sx+(e.x-sx)*p,y:sy+(e.y-sy)*p,vx:0,vy:0,l:220,ml:220,c:'#9fe8ff',s:5});
 }
 addFx(e.x,e.y,'#cfefff',8,3,300,3);
 if(e===player)addText(e.x,e.y-30,'緊急回避','#9fe8ff');
}
function useHeal(){if(player.items.heal>0&&player.hp<player.max){player.items.heal--;heal(player,40);}}
function useFood(){if(player.items.food>0){player.items.food--;player.food=Math.min(100,player.food+55);addText(player.x,player.y-26,'満腹度+55','#ffd9a0');}}
function usePot(){if(player.items.pot>0){player.items.pot--;player.guard=Math.min(120,player.guard+55);addText(player.x,player.y-26,'防御+55','#a8b8ff');}}
function interact(){
 for(let i=drops.length-1;i>=0;i--){
  const d=drops[i];
  if(d.type==='w'&&Math.hypot(d.x-player.x,d.y-player.y)<44){takeWeapon(player,d.data);drops.splice(i,1);return;}
 }
}
/* ================= PLAYER ================= */
function updatePlayer(dt){
 const e=player;if(!e.alive)return;
 timeAlive+=dt;
 let dx=0,dy=0;
 if(keys['KeyW']||keys['ArrowUp'])dy--;
 if(keys['KeyS']||keys['ArrowDown'])dy++;
 if(keys['KeyA']||keys['ArrowLeft'])dx--;
 if(keys['KeyD']||keys['ArrowRight'])dx++;
 if(stick.on){dx+=stick.x;dy+=stick.y;}
 const m=Math.hypot(dx,dy)||1;
 const spd=2.35*e.ch.spd*(e.slow>0?0.55:1)*(e.food<=0?0.55:1)*(e.stun>0?0:1)*dt/16;
 if(dx||dy)moveEnt(e,dx/m*spd,dy/m*spd);
 // 照準
 if(e.aimLock&&e.aimLock.alive)e.ang=Math.atan2(e.aimLock.y-e.y,e.aimLock.x-e.x);
 else e.ang=Math.atan2(mouse.y-H/2,mouse.x-W/2);
 const w=curW(e);
 e.sub=(mouse.rdown||keys['ShiftLeft'])?1:0;
 e.blockW=w&&wdef(w).e.block?1:0;
 e.blade=(w&&wdef(w).e.barrier&&e.bladeOn)?1:0;
 if(w&&wdef(w).e.charge){
  if(mouse.down&&e.cool<=0){e.charging=1;e.charge=Math.min(1000,e.charge+dt);}
 } else if(mouse.down)fire(e);
}
/* ================= RENDER ================= */
let mapCanvas=null,mapOpen=false;
function buildMinimap(){
 mapCanvas=document.createElement('canvas');mapCanvas.width=MW;mapCanvas.height=MH;
 const c=mapCanvas.getContext('2d');
 const im=c.createImageData(MW,MH);
 for(let i=0;i<MW*MH;i++){
  const t=grid[i];let r=13,g=18,b=28;
  if(t===WALL){r=54;g=62;b=80;}
  if(t===HOUSE){r=96;g=78;b=62;}
  if(t===ROCK){r=38;g=44;b=56;}
  if(t===HIGH){r=30;g=44;b=62;}
  if(t===STAIR){r=120;g=180;b=210;}
  im.data[i*4]=r;im.data[i*4+1]=g;im.data[i*4+2]=b;im.data[i*4+3]=255;
 }
 c.putImageData(im,0,0);
}
function draw(){
 const t=now();
 ctx.fillStyle='#07090f';ctx.fillRect(0,0,W,H);
 let sx=0,sy=0;
 if(cam.sh>0){sx=rnd(-cam.sh,cam.sh);sy=rnd(-cam.sh,cam.sh);cam.sh*=0.88;if(cam.sh<0.4)cam.sh=0;}
 cam.x=player.x-W/2+sx;cam.y=player.y-H/2+sy;
 ctx.save();ctx.translate(-cam.x,-cam.y);
 const x0=Math.floor(cam.x/TS)-1,y0=Math.floor(cam.y/TS)-1;
 const x1=x0+Math.ceil(W/TS)+3,y1=y0+Math.ceil(H/TS)+3;
 // 地面
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const tt=T(x,y);const px=x*TS,py=y*TS;
  if(tt===FLOOR){
   ctx.fillStyle=((x+y)&1)?'#0e1420':'#101827';
   ctx.fillRect(px,py,TS,TS);
  } else if(tt===HIGH){
   ctx.fillStyle=((x+y)&1)?'#152238':'#182740';
   ctx.fillRect(px,py,TS,TS);
   if(T(x,y+1)!==HIGH&&T(x,y+1)!==WALL){ctx.fillStyle='#0a0f19';ctx.fillRect(px,py+TS,TS,7);}
  } else if(tt===STAIR){
   ctx.fillStyle='#1d3348';ctx.fillRect(px,py,TS,TS);
   ctx.strokeStyle='#4f9ec4';ctx.lineWidth=1.5;
   for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(px+3,py+i*8);ctx.lineTo(px+TS-3,py+i*8);ctx.stroke();}
  } else if(tt===ROCK){
   ctx.fillStyle='#0e1420';ctx.fillRect(px,py,TS,TS);
   ctx.fillStyle='#1e2634';ctx.beginPath();ctx.arc(px+16,py+16,12,0,TAU);ctx.fill();
   ctx.fillStyle='#2b3547';ctx.beginPath();ctx.arc(px+13,py+13,7,0,TAU);ctx.fill();
  } else if(tt===WALL||tt===HOUSE){
   ctx.fillStyle=tt===HOUSE?'#3a2f26':'#232b3a';ctx.fillRect(px,py,TS,TS);
   ctx.fillStyle=tt===HOUSE?'#4b3c2f':'#2c3648';ctx.fillRect(px+2,py+2,TS-4,TS-6);
   ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(px,py+TS-5,TS,5);
  }
 }
 // バリア
 for(const b of barriers){
  const al=clamp(b.l/b.ml,0,1);
  if(b.earth){
   ctx.fillStyle='rgba(150,110,60,'+(0.55*al)+')';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
   ctx.strokeStyle='rgba(210,170,110,'+(0.8*al)+')';ctx.lineWidth=3;ctx.stroke();
   ctx.fillStyle='rgba(90,62,34,'+(0.5*al)+')';
   ctx.beginPath();ctx.arc(b.x-8,b.y-6,b.r*0.35,0,TAU);ctx.fill();
  } else {
   ctx.fillStyle='rgba(123,224,192,'+(0.14*al)+')';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
   ctx.strokeStyle='rgba(160,255,225,'+(0.7*al)+')';ctx.lineWidth=2;ctx.stroke();
  }
 }
 // 宝箱
 for(const c of chests){
  if(c.x<cam.x-40||c.x>cam.x+W+40||c.y<cam.y-40||c.y>cam.y+H+40)continue;
  if(c.op){ctx.globalAlpha=0.4;}
  ctx.fillStyle=c.sh>0?'#ffe9a0':'#8a6a2e';
  ctx.fillRect(c.x-13,c.y-10,26,20);
  ctx.fillStyle='#c8a24a';ctx.fillRect(c.x-13,c.y-10,26,7);
  ctx.fillStyle='#f0d071';ctx.fillRect(c.x-3,c.y-3,6,6);
  ctx.globalAlpha=1;
  if(c.sh>0)c.sh-=0.08;
  if(!c.op&&c.hp<c.max){ctx.fillStyle='#000';ctx.fillRect(c.x-14,c.y-17,28,3);ctx.fillStyle='#ffd166';ctx.fillRect(c.x-14,c.y-17,28*(c.hp/c.max),3);}
 }
 // ドロップ
 for(const d of drops){
  if(d.x<cam.x-30||d.x>cam.x+W+30||d.y<cam.y-30||d.y>cam.y+H+30)continue;
  const bob=Math.sin(t/300+d.x)*2;
  if(d.type==='w'){
   const col=rankColor(d.data.r,t);
   ctx.shadowBlur=12;ctx.shadowColor=col;ctx.fillStyle=col;
   ctx.fillRect(d.x-4,d.y-9+bob,8,18);ctx.shadowBlur=0;
   if(Math.hypot(d.x-player.x,d.y-player.y)<70){
    ctx.fillStyle='#dfe9f5';ctx.font='11px system-ui';ctx.textAlign='center';
    ctx.fillText('[E] '+d.data.n,d.x,d.y-18+bob);
   }
  } else {
   const cc={ammo:'#9fc2e8',heal:'#7CFFB2',food:'#ffd08a',pot:'#a8b8ff'}[d.type];
   ctx.fillStyle=cc;ctx.beginPath();ctx.arc(d.x,d.y+bob,6,0,TAU);ctx.fill();
  }
 }
 // 炎の海など
 for(const h of hazards){
  if(h.x<cam.x-200||h.x>cam.x+W+200||h.y<cam.y-200||h.y>cam.y+H+200)continue;
  const al=clamp(h.l/1200,0,1);
  const g=ctx.createRadialGradient(h.x,h.y,4,h.x,h.y,h.r);
  g.addColorStop(0,'rgba(255,190,90,'+(0.42*al)+')');
  g.addColorStop(1,'rgba(255,90,30,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(255,150,70,'+(0.55*al)+')';ctx.lineWidth=2;ctx.stroke();
 }
 // 落雷の予告
 for(const m of strikes){
  if(m.x<cam.x-260||m.x>cam.x+W+260||m.y<cam.y-260||m.y>cam.y+H+260)continue;
  const p=1-clamp(m.t/900,0,1);
  ctx.strokeStyle='rgba(180,230,255,'+(0.35+p*0.6)+')';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(m.x,m.y,m.r*(0.35+p*0.65),0,TAU);ctx.stroke();
  ctx.fillStyle='rgba(140,210,255,'+(0.10+p*0.2)+')';ctx.fill();
 }
 // ビーム
 for(const b of bossList){
  if(!b.alive)continue;
  if(b.beamWarn>0){
   ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.setLineDash([10,10]);
   ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x+Math.cos(b.beamAng)*820,b.y+Math.sin(b.beamAng)*820);ctx.stroke();
   ctx.setLineDash([]);
  }
  if(b.beamT>0){
   const ex=b.x+Math.cos(b.beamAng)*b.beamLen,ey=b.y+Math.sin(b.beamAng)*b.beamLen;
   const puls=0.75+Math.sin(t/40)*0.25;
   ctx.shadowBlur=30;ctx.shadowColor=b.def.col;
   ctx.strokeStyle=b.def.col;ctx.lineWidth=30*puls;ctx.globalAlpha=0.28;
   ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(ex,ey);ctx.stroke();
   ctx.globalAlpha=1;ctx.lineWidth=13*puls;
   ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(ex,ey);ctx.stroke();
   ctx.strokeStyle='#ffffff';ctx.lineWidth=5*puls;
   ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(ex,ey);ctx.stroke();
   ctx.shadowBlur=0;
   ctx.fillStyle=b.def.col;ctx.beginPath();ctx.arc(ex,ey,16*puls,0,TAU);ctx.fill();
  }
 }
 // ボス
 for(const b of bossList){
  if(!b.alive)continue;
  if(b.x<cam.x-260||b.x>cam.x+W+260||b.y<cam.y-260||b.y>cam.y+H+260)continue;
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.ang+Math.PI/2);
  if(b.clone)ctx.globalAlpha=0.62;
  drawBossShape(b,t);
  ctx.restore();ctx.globalAlpha=1;ctx.shadowBlur=0;
  if(b.inv>0){
   ctx.strokeStyle='rgba(159,232,255,'+(0.4+Math.sin(t/90)*0.3)+')';ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(b.x,b.y,b.r+12,0,TAU);ctx.stroke();
  }
  if(b.rest>0){
   const p=0.5+Math.sin(t/140)*0.4;
   ctx.strokeStyle='rgba(255,209,102,'+p+')';ctx.lineWidth=4;ctx.setLineDash([9,7]);
   ctx.beginPath();ctx.arc(b.x,b.y,b.r+18,0,TAU);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#ffd166';ctx.font='bold 13px system-ui';ctx.textAlign='center';
   ctx.fillText('チャンスタイム '+(b.rest/1000).toFixed(1)+'秒',b.x,b.y-b.r-26);
  }
 }
 // 弾
 for(const b of bullets){
  if(b.x<cam.x-40||b.x>cam.x+W+40||b.y<cam.y-40||b.y>cam.y+H+40)continue;
  ctx.shadowBlur=b.rail?26:(b.slash?20:8);ctx.shadowColor=b.col;
  ctx.fillStyle=b.col;
  if(b.slash){
   ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.ang);
   ctx.globalAlpha=0.85;ctx.lineWidth=6;ctx.strokeStyle=b.col;
   ctx.beginPath();ctx.arc(0,0,26,-0.9,0.9);ctx.stroke();
   ctx.lineWidth=3;ctx.strokeStyle='#eafff8';
   ctx.beginPath();ctx.arc(0,0,20,-0.8,0.8);ctx.stroke();
   ctx.globalAlpha=1;ctx.restore();ctx.shadowBlur=0;continue;
  }
  ctx.beginPath();ctx.arc(b.x,b.y,b.sz,0,TAU);ctx.fill();
  ctx.strokeStyle=b.col;ctx.lineWidth=b.sz*0.8;ctx.globalAlpha=0.5;
  ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*1.4,b.y-b.vy*1.4);ctx.stroke();
  ctx.globalAlpha=1;ctx.shadowBlur=0;
 }
 // エンティティ
 for(const e of ents){
  if(!e.alive)continue;
  if(e.x<cam.x-60||e.x>cam.x+W+60||e.y<cam.y-60||e.y>cam.y+H+60)continue;
  drawEnt(e,t);
 }
 // エフェクト
 for(const f of fx){
  const a=clamp(f.l/f.ml,0,1);
  if(f.slash){
   ctx.strokeStyle=f.c;ctx.globalAlpha=a*0.85;ctx.lineWidth=5;
   ctx.beginPath();ctx.arc(f.x,f.y,f.rc*0.9,f.a-f.arc,f.a+f.arc);ctx.stroke();
   ctx.globalAlpha=1;continue;
  }
  if(f.line){
   ctx.strokeStyle=f.c;ctx.globalAlpha=a;ctx.lineWidth=3;ctx.shadowBlur=10;ctx.shadowColor=f.c;
   ctx.beginPath();ctx.moveTo(f.x1,f.y1);ctx.lineTo(f.x2,f.y2);ctx.stroke();
   ctx.globalAlpha=1;ctx.shadowBlur=0;continue;
  }
  ctx.globalAlpha=a;ctx.fillStyle=f.c;
  ctx.beginPath();ctx.arc(f.x,f.y,f.s*a,0,TAU);ctx.fill();ctx.globalAlpha=1;
 }
 // ダメージ数値
 ctx.textAlign='center';ctx.font='bold 14px system-ui';
 for(const d of dmgTexts){
  ctx.globalAlpha=clamp(d.l/900,0,1);ctx.fillStyle=d.c;
  ctx.strokeStyle='rgba(0,0,0,.8)';ctx.lineWidth=3;
  ctx.strokeText(d.t,d.x,d.y);ctx.fillText(d.t,d.x,d.y);
 }
 ctx.globalAlpha=1;
 ctx.restore();
 drawHUD(t);
}
function drawBossShape(b,t){
 const R=b.r,c=b.def.col,hit=b.hit>0;
 ctx.shadowBlur=26;ctx.shadowColor=c;
 const body=hit?'#ffffff':c;
 const dark='rgba(0,0,0,.42)';
 if(b.def.ab==='clone'){
  // 神速の帝王鷹：真上から見た鳥
  const flap=Math.sin(t/110)*0.30;
  for(const sgn of [-1,1]){
   ctx.save();ctx.rotate(sgn*(0.30+flap));
   ctx.fillStyle=body;
   ctx.beginPath();
   ctx.moveTo(0,-R*0.15);
   ctx.quadraticCurveTo(sgn*R*1.5,-R*0.35,sgn*R*1.75,R*0.55);
   ctx.quadraticCurveTo(sgn*R*0.85,R*0.30,0,R*0.50);
   ctx.closePath();ctx.fill();
   ctx.strokeStyle=dark;ctx.lineWidth=2;
   for(let k=1;k<=3;k++){ctx.beginPath();ctx.moveTo(sgn*R*0.35*k,R*0.10);ctx.lineTo(sgn*R*(0.5+0.42*k),R*0.55);ctx.stroke();}
   ctx.restore();
  }
  ctx.fillStyle=body;                       // 尾
  ctx.beginPath();ctx.moveTo(-R*0.34,R*0.5);ctx.lineTo(0,R*1.45);ctx.lineTo(R*0.34,R*0.5);ctx.closePath();ctx.fill();
  ctx.fillStyle=body;                       // 胴
  ctx.beginPath();ctx.ellipse(0,R*0.1,R*0.42,R*0.86,0,0,TAU);ctx.fill();
  ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(0,R*0.25,R*0.24,R*0.5,0,0,TAU);ctx.fill();
  ctx.fillStyle=body;                       // 頭
  ctx.beginPath();ctx.arc(0,-R*0.62,R*0.30,0,TAU);ctx.fill();
  ctx.fillStyle='#ffb43a';                  // くちばし
  ctx.beginPath();ctx.moveTo(-R*0.16,-R*0.80);ctx.lineTo(0,-R*1.30);ctx.lineTo(R*0.16,-R*0.80);ctx.closePath();ctx.fill();
  ctx.fillStyle='#20140a';
  ctx.beginPath();ctx.arc(-R*0.15,-R*0.66,R*0.07,0,TAU);ctx.arc(R*0.15,-R*0.66,R*0.07,0,TAU);ctx.fill();
 }
 else if(b.def.ab==='thunder'){
  // 雷霧の巨兵：鬼。角は雷の形
  ctx.fillStyle=body;                       // 肩
  ctx.beginPath();ctx.ellipse(0,R*0.55,R*0.95,R*0.55,0,0,TAU);ctx.fill();
  ctx.fillStyle=dark;ctx.beginPath();ctx.ellipse(0,R*0.62,R*0.62,R*0.3,0,0,TAU);ctx.fill();
  ctx.fillStyle=body;                       // 頭
  ctx.beginPath();ctx.ellipse(0,-R*0.16,R*0.72,R*0.66,0,0,TAU);ctx.fill();
  const gl=0.55+Math.sin(t/120)*0.45;       // 雷の角
  ctx.shadowBlur=22;ctx.shadowColor='#cdefff';
  ctx.strokeStyle='rgba(215,242,255,'+(0.55+gl*0.45)+')';ctx.lineWidth=5;ctx.lineJoin='round';
  for(const sgn of [-1,1]){
   ctx.beginPath();
   ctx.moveTo(sgn*R*0.42,-R*0.55);
   ctx.lineTo(sgn*R*0.30,-R*0.92);
   ctx.lineTo(sgn*R*0.62,-R*0.98);
   ctx.lineTo(sgn*R*0.42,-R*1.48);
   ctx.stroke();
  }
  ctx.shadowBlur=26;ctx.shadowColor=c;
  ctx.fillStyle='#ffe9a0';                  // 目
  ctx.beginPath();ctx.moveTo(-R*0.42,-R*0.30);ctx.lineTo(-R*0.12,-R*0.20);ctx.lineTo(-R*0.40,-R*0.10);ctx.closePath();
  ctx.moveTo(R*0.42,-R*0.30);ctx.lineTo(R*0.12,-R*0.20);ctx.lineTo(R*0.40,-R*0.10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffffff';                  // 牙
  ctx.beginPath();ctx.moveTo(-R*0.22,R*0.16);ctx.lineTo(-R*0.10,R*0.40);ctx.lineTo(-R*0.02,R*0.16);ctx.closePath();
  ctx.moveTo(R*0.22,R*0.16);ctx.lineTo(R*0.10,R*0.40);ctx.lineTo(R*0.02,R*0.16);ctx.closePath();ctx.fill();
 }
 else if(b.def.ab==='barrier'){
  // 蒼盾の守護者：盾そのもの
  ctx.fillStyle=body;
  ctx.beginPath();
  ctx.moveTo(-R*0.95,-R*0.90);
  ctx.lineTo(R*0.95,-R*0.90);
  ctx.lineTo(R*0.95,R*0.25);
  ctx.quadraticCurveTo(R*0.80,R*1.05,0,R*1.42);
  ctx.quadraticCurveTo(-R*0.80,R*1.05,-R*0.95,R*0.25);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=4;ctx.stroke();
  ctx.fillStyle=dark;                       // 十字の紋
  ctx.fillRect(-R*0.13,-R*0.72,R*0.26,R*1.75);
  ctx.fillRect(-R*0.70,-R*0.22,R*1.40,R*0.26);
  const gl=0.4+Math.sin(t/200)*0.3;
  ctx.fillStyle='rgba(255,255,255,'+gl+')';
  ctx.beginPath();ctx.arc(0,-R*0.10,R*0.20,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';     // 鋲
  for(const p of [[-0.72,-0.66],[0.72,-0.66],[-0.72,0.18],[0.72,0.18]]){
   ctx.beginPath();ctx.arc(p[0]*R,p[1]*R,R*0.09,0,TAU);ctx.fill();
  }
 }
 else {
  // 四神の化身：騎士
  ctx.fillStyle=body;                       // 肩当て
  ctx.beginPath();ctx.ellipse(-R*0.78,R*0.30,R*0.42,R*0.34,-0.4,0,TAU);ctx.fill();
  ctx.beginPath();ctx.ellipse(R*0.78,R*0.30,R*0.42,R*0.34,0.4,0,TAU);ctx.fill();
  ctx.fillStyle='#cfd8e6';                  // 剣
  ctx.fillRect(R*0.68,-R*1.50,R*0.17,R*1.65);
  ctx.fillStyle=body;ctx.fillRect(R*0.52,R*0.08,R*0.50,R*0.16);
  ctx.fillStyle='#9fb6d4';                  // 盾
  ctx.beginPath();
  ctx.moveTo(-R*0.60,-R*0.55);ctx.lineTo(-R*1.32,-R*0.42);
  ctx.lineTo(-R*1.32,R*0.42);ctx.quadraticCurveTo(-R*0.96,R*0.92,-R*0.60,R*0.52);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=body;                       // 胴
  ctx.beginPath();ctx.ellipse(0,R*0.24,R*0.60,R*0.74,0,0,TAU);ctx.fill();
  ctx.fillStyle=body;                       // 兜
  ctx.beginPath();
  ctx.moveTo(0,-R*1.10);ctx.quadraticCurveTo(R*0.62,-R*0.86,R*0.52,-R*0.10);
  ctx.lineTo(-R*0.52,-R*0.10);ctx.quadraticCurveTo(-R*0.62,-R*0.86,0,-R*1.10);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle='#1b0f08';ctx.fillRect(-R*0.40,-R*0.60,R*0.80,R*0.15);
  ctx.fillStyle='rgba(255,190,120,'+(0.6+Math.sin(t/150)*0.35)+')';
  ctx.fillRect(-R*0.34,-R*0.57,R*0.24,R*0.09);ctx.fillRect(R*0.10,-R*0.57,R*0.24,R*0.09);
  ctx.fillStyle=body;                       // 兜飾り
  ctx.beginPath();ctx.moveTo(0,-R*1.10);ctx.lineTo(-R*0.10,-R*1.58);ctx.lineTo(R*0.10,-R*1.58);ctx.closePath();ctx.fill();
 }
 ctx.shadowBlur=0;
}
function drawEnt(e,t){
 const w=curW(e);
 ctx.save();ctx.translate(e.x,e.y);
 // 影・段差
 ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,e.lvl?10:8,13,6,0,0,TAU);ctx.fill();
 const yo=e.lvl?-6:0;
 ctx.rotate(e.ang);
 // 武器
 if(w){
  const d=wdef(w),col=wcol(w,t);
  const sw=e.swingT>0?Math.sin(e.swingT/180*Math.PI)*0.9:0;
  ctx.save();ctx.rotate(-sw);
  ctx.strokeStyle=col;ctx.lineWidth=d.t==='m'?5:4;ctx.shadowBlur=e.blade?16:6;ctx.shadowColor=col;
  ctx.beginPath();ctx.moveTo(8,yo+3);
  ctx.lineTo(8+(d.t==='m'?Math.min(d.rc,60):22),yo+3);ctx.stroke();
  ctx.shadowBlur=0;ctx.restore();
 }
 ctx.rotate(-e.ang);
 // 本体
 ctx.fillStyle=e.flash>0?'#fff':e.col;
 ctx.beginPath();ctx.arc(0,yo,e.r,0,TAU);ctx.fill();
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(0,yo,e.r*0.62,0,TAU);ctx.fill();
 // 向き
 ctx.fillStyle=e===player?'#fff':'rgba(255,255,255,.7)';
 ctx.beginPath();ctx.arc(Math.cos(e.ang)*9,yo+Math.sin(e.ang)*9,3.5,0,TAU);ctx.fill();
 if(e===player){ctx.strokeStyle='#7fd8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,yo,e.r+4,0,TAU);ctx.stroke();}
 if(e.inv>0){
  ctx.strokeStyle='rgba(159,232,255,'+(0.35+Math.sin(t/80)*0.3)+')';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(0,yo,e.r+8,0,TAU);ctx.stroke();
 }
 if(e.stun>0){ctx.fillStyle='#ffe27a';ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillText('★',0,yo-22);}
 if(e.burn>0){ctx.fillStyle='#ff8a3d';ctx.beginPath();ctx.arc(rnd(-8,8),yo-14,3,0,TAU);ctx.fill();}
 // HPバー
 const bw=30;
 ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(-bw/2,yo-e.r-11,bw,4);
 ctx.fillStyle=e===player?'#7CFFB2':'#ff6b6b';ctx.fillRect(-bw/2,yo-e.r-11,bw*clamp(e.hp/e.max,0,1),4);
 if(e.guard>0){ctx.fillStyle='#8fb8ff';ctx.fillRect(-bw/2,yo-e.r-15,bw*clamp(e.guard/120,0,1),3);}
 if(e!==player&&Math.hypot(e.x-player.x,e.y-player.y)<420){
  ctx.fillStyle='rgba(220,232,245,.75)';ctx.font='10px system-ui';ctx.textAlign='center';
  ctx.fillText(e.name,0,yo-e.r-18);
 }
 ctx.restore();
}

/* ================= HUD ================= */
function drawHUD(t){
 const P=player;
 // 上部：残り人数
 ctx.textAlign='center';
 ctx.fillStyle='rgba(8,12,20,.72)';roundRect(W/2-92,10,184,44,10);ctx.fill();
 ctx.fillStyle=expMode?'#ffb0e0':'#eaf2ff';ctx.font='bold 22px system-ui';
 ctx.fillText(expMode?'実験モード':'残り '+alive+' 人',W/2,36);
 ctx.fillStyle='#8fa5bd';ctx.font='11px system-ui';
 ctx.fillText(expMode?'ボス残り '+bossList.filter(b=>b.alive&&!b.clone).length+'体　経過 '+Math.floor(timeAlive/1000)+'秒'
                     :'撃破 '+P.kills+'　生存 '+Math.floor(timeAlive/1000)+'秒',W/2,50);
 if(P.god){
  ctx.textAlign='center';ctx.fillStyle='#ffb0e0';ctx.font='bold 15px system-ui';
  ctx.fillText('実験モード　無敵',W/2,H*0.36);
 } else if(P.inv>0){
  ctx.textAlign='center';ctx.fillStyle='#9fe8ff';ctx.font='bold 15px system-ui';
  ctx.fillText('無敵 '+(P.inv/1000).toFixed(1)+'秒',W/2,H*0.36);
 }
 // 左下ステータス
 const bx=16,by=H-118;
 ctx.fillStyle='rgba(8,12,20,.72)';roundRect(bx-8,by-10,268,110,10);ctx.fill();
 bar(bx,by,240,14,P.hp/P.max,'#7CFFB2','体力 '+Math.max(0,Math.round(P.hp))+'/'+P.max);
 bar(bx,by+24,240,10,P.guard/120,'#8fb8ff','防御 '+Math.round(P.guard));
 bar(bx,by+44,240,10,P.food/100,P.food<25?'#ff8a8a':'#ffd08a','満腹度 '+Math.round(P.food));
 ctx.textAlign='left';ctx.font='12px system-ui';ctx.fillStyle='#a9bdd4';
 ctx.fillText('弾薬 '+P.ammo+'　　回復[R] '+P.items.heal+'　食料[F] '+P.items.food+'　薬[G] '+P.items.pot,bx,by+80);
 ctx.fillStyle=P.food>=10?'#9fe8ff':'#5b6b7d';
 ctx.fillText('緊急回避[Space] 食料-10',bx,by+96);
 if(P.food<=0){ctx.fillStyle='#ff8a8a';ctx.fillText('空腹！体力が減り、動きが遅い',bx+180,by+96);}
 // 右下 武器
 const nS=P.wp.length, comp=nS>2;
 const rowH=comp?24:38, gap=comp?3:6, boxW=comp?228:216;
 const wx=W-boxW-16, wy0=H-16-(rowH+gap)*nS+gap;
 for(let i=0;i<nS;i++){
  const w=P.wp[i], wy=wy0+i*(rowH+gap);
  ctx.fillStyle=i===P.cur?'rgba(30,44,66,.92)':'rgba(8,12,20,.7)';
  roundRect(wx,wy,boxW,rowH,comp?6:8);ctx.fill();
  if(i===P.cur){ctx.strokeStyle='#7fd8ff';ctx.lineWidth=1.5;ctx.stroke();}
  ctx.textAlign='left';
  ctx.fillStyle=i===P.cur?'#7fd8ff':'#54687f';
  ctx.font='bold 10px system-ui';
  ctx.fillText(String(i===9?0:i+1),wx+7,wy+rowH/2+3.5);
  if(w){
   const col=wcol(w,t),d=wdef(w);
   ctx.fillStyle=col;ctx.fillRect(wx+18,wy+4,4,rowH-8);
   ctx.fillStyle='#eaf2ff';ctx.font='bold '+(comp?11:13)+'px system-ui';
   const nm=w.n.length>(comp?13:15)?w.n.slice(0,comp?13:15)+'…':w.n;
   ctx.fillText(nm,wx+28,comp?wy+rowH/2+4:wy+17);
   ctx.fillStyle=col;ctx.font=(comp?10:11)+'px system-ui';
   const info=RANKS[w.r].k+'　攻撃'+Math.round(wdmg(w))+'　'+(d.t==='m'?'近接':'遠距離');
   if(comp)ctx.fillText(info,wx+boxW-4-ctx.measureText(info).width,wy+rowH/2+4);
   else ctx.fillText(info,wx+28,wy+31);
  } else {
   ctx.fillStyle='#3d4c5f';ctx.font=(comp?10:12)+'px system-ui';
   ctx.fillText('空きスロット',wx+28,comp?wy+rowH/2+4:wy+24);
  }
 }
 // チャージ
 const cw=curW(P);
 if(cw&&wdef(cw).e.charge&&P.charge>0){
  const c=clamp(P.charge/900,0,1);
  ctx.fillStyle='rgba(8,12,20,.8)';roundRect(W/2-70,H-150,140,10,5);ctx.fill();
  ctx.fillStyle=c>=1?'#ffe27a':'#7fd8ff';roundRect(W/2-70,H-150,140*c,10,5);ctx.fill();
 }
 if(cw&&wdef(cw).e.barrier){
  ctx.textAlign='center';ctx.font='12px system-ui';
  let msg,col;
  if(P.bladeCd>0){col='#ff8a8a';msg='使用不能　復帰まで '+(P.bladeCd/1000).toFixed(1)+'秒';}
  else if(P.bladeOn){col='#7be0c0';msg='バリア纏い ON（攻撃力4倍・斬撃を飛ばせる）　残り '+(P.bladeTime/1000).toFixed(1)+'秒';}
  else{col='#7f93aa';msg='バリア纏い OFF（Xで発動・持続'+(P.bladeTime/1000).toFixed(0)+'秒）';}
  ctx.fillStyle=col;ctx.fillText(msg,W/2,H-158);
  const bw=220,bx2=W/2-bw/2;
  ctx.fillStyle='rgba(255,255,255,.1)';roundRect(bx2,H-152,bw,5,3);ctx.fill();
  ctx.fillStyle=P.bladeCd>0?'#ff8a8a':'#7be0c0';
  roundRect(bx2,H-152,bw*(P.bladeCd>0?1-P.bladeCd/10000:P.bladeTime/60000),5,3);ctx.fill();
 } else if(cw&&wdef(cw).e.elem){
  ctx.textAlign='center';ctx.fillStyle='#9fe8ff';ctx.font='12px system-ui';
  ctx.fillText('属性: '+['火','雷','水','土'][P.elem]+'（Xで切替）',W/2,H-158);
 }
 // ボスHP
 for(const b of bossList){
  if(!b.alive)continue;
  if(Math.hypot(b.x-P.x,b.y-P.y)>620)continue;
  ctx.fillStyle='rgba(8,12,20,.8)';roundRect(W/2-180,66,360,26,8);ctx.fill();
  ctx.fillStyle=b.def.col;roundRect(W/2-176,70,352*clamp(b.hp/b.max,0,1),18,6);ctx.fill();
  ctx.fillStyle='#0a0f18';ctx.font='bold 13px system-ui';ctx.textAlign='center';
  ctx.fillText(b.def.n+'　'+Math.max(0,Math.round(b.hp)),W/2,84);
 }
 // キルログ
 ctx.textAlign='right';ctx.font='12px system-ui';
 feed.forEach((f,i)=>{ctx.globalAlpha=clamp(f.a,0,1);ctx.fillStyle=f.c;ctx.fillText(f.t,W-16,74+i*18);});
 ctx.globalAlpha=1;
 // ミニマップ
 const ms=mapOpen?Math.min(W,H)*0.8:150;
 const mx=mapOpen?(W-ms)/2:W-ms-14,my=mapOpen?(H-ms)/2:14;
 ctx.fillStyle='rgba(6,9,15,.85)';roundRect(mx-4,my-4,ms+8,ms+8,8);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(mapCanvas,mx,my,ms,ms);
 ctx.imageSmoothingEnabled=true;
 const sc=ms/WW;
 for(const c of chests){if(c.op)continue;ctx.fillStyle='rgba(255,209,102,.55)';ctx.fillRect(mx+c.x*sc-1,my+c.y*sc-1,2,2);}
 for(const b of bossList){if(!b.alive)continue;ctx.fillStyle=b.def.col;ctx.beginPath();ctx.arc(mx+b.x*sc,my+b.y*sc,4,0,TAU);ctx.fill();}
 for(const e of ents){if(!e.alive||e===player)continue;
  if(mapOpen||alive<=5||Math.hypot(e.x-player.x,e.y-player.y)<900){ctx.fillStyle='#ff6b6b';ctx.fillRect(mx+e.x*sc-1.5,my+e.y*sc-1.5,3,3);}}
 ctx.fillStyle='#7fd8ff';ctx.beginPath();ctx.arc(mx+player.x*sc,my+player.y*sc,3.5,0,TAU);ctx.fill();
 ctx.strokeStyle='rgba(127,216,255,.5)';ctx.lineWidth=1;ctx.strokeRect(mx,my,ms,ms);
 if(!mapOpen){ctx.fillStyle='#68809a';ctx.font='10px system-ui';ctx.textAlign='right';ctx.fillText('[M] 拡大',mx+ms,my+ms+14);}
 // スマホ用の緊急回避ボタン
 if(isTouch){
  dashBtn={x:W-72,y:H-190,r:34};
  ctx.fillStyle=P.food>=10?'rgba(30,58,84,.85)':'rgba(24,30,40,.7)';
  ctx.beginPath();ctx.arc(dashBtn.x,dashBtn.y,dashBtn.r,0,TAU);ctx.fill();
  ctx.strokeStyle=P.food>=10?'#7fd8ff':'#3d4c5f';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=P.food>=10?'#cfefff':'#54687f';ctx.font='bold 12px system-ui';ctx.textAlign='center';
  ctx.fillText('回避',dashBtn.x,dashBtn.y-1);
  ctx.font='10px system-ui';ctx.fillText('食料-10',dashBtn.x,dashBtn.y+13);
 }
 // タッチ用スティック
 if(stick.on){
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(stick.ox,stick.oy,54,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(127,216,255,.5)';ctx.beginPath();ctx.arc(stick.ox+stick.x*40,stick.oy+stick.y*40,22,0,TAU);ctx.fill();
 }
 // 照準
 if(!isTouch){
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(mouse.x,mouse.y,7,0,TAU);ctx.stroke();
  ctx.beginPath();ctx.moveTo(mouse.x-12,mouse.y);ctx.lineTo(mouse.x-4,mouse.y);
  ctx.moveTo(mouse.x+4,mouse.y);ctx.lineTo(mouse.x+12,mouse.y);
  ctx.moveTo(mouse.x,mouse.y-12);ctx.lineTo(mouse.x,mouse.y-4);
  ctx.moveTo(mouse.x,mouse.y+4);ctx.lineTo(mouse.x,mouse.y+12);ctx.stroke();
 }
}
function bar(x,y,w,h,v,c,label){
 ctx.fillStyle='rgba(255,255,255,.09)';roundRect(x,y,w,h,h/2);ctx.fill();
 ctx.fillStyle=c;roundRect(x,y,w*clamp(v,0,1),h,h/2);ctx.fill();
 ctx.fillStyle='#0d131d';ctx.font='bold 10px system-ui';ctx.textAlign='left';
 ctx.fillText(label,x+8,y+h-3.5);
}
function roundRect(x,y,w,h,r){
 ctx.beginPath();
 ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
const isTouch=('ontouchstart' in window);

/* ================= LOOP ================= */
let last=0;
function loop(ts){
 requestAnimationFrame(loop);
 if(!started)return;
 const dt=Math.min(50,ts-last||16);last=ts;
 if(!gameOver){
  gt+=dt;
  updatePlayer(dt);
  for(const e of ents)if(e!==player)updateEnt(e,dt);
  updateEnt(player,dt);
  for(const b of bossList)updateBoss(b,dt);
  updateBullets(dt);
  updateHazards(dt);
  for(let i=barriers.length-1;i>=0;i--){barriers[i].l-=dt;if(barriers[i].l<=0)barriers.splice(i,1);}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.l-=dt;if(f.vx!==undefined){f.x+=f.vx;f.y+=f.vy;f.vx*=0.92;f.vy*=0.92;}if(f.l<=0)fx.splice(i,1);}
  for(let i=dmgTexts.length-1;i>=0;i--){const d=dmgTexts[i];d.l-=dt;d.y+=d.vy;if(d.l<=0)dmgTexts.splice(i,1);}
  for(const f of feed)f.a-=dt/9000;
  if(!expMode&&alive<=1&&player.alive&&!gameOver){gameOver=1;endGame(true);}
 }
 draw();
}
function endGame(win){
 const el=$('#over');
 el.style.display='flex';
 $('#overTitle').textContent=win?'最後の1人になった':'倒れた';
 $('#overTitle').style.color=win?'#ffd166':'#ff8a8a';
 $('#overSub').innerHTML='順位 <b>'+(win?1:alive+1)+'位</b> / 100人　　撃破 <b>'+player.kills+'</b>人　　生存 <b>'+Math.floor(timeAlive/1000)+'</b>秒';
}

/* ================= 画面 / 図鑑 ================= */
let selChar='kni';
function buildCharCards(){
 const wrap=$('#chars');
 wrap.innerHTML='';
 CHARS.forEach(c=>{
  const sp=SP[c.w];
  const d=document.createElement('button');
  d.className='card'+(c.id===selChar?' on':'');
  d.dataset.id=c.id;
  d.innerHTML='<span class="dot" style="background:'+c.col+'"></span>'+
   '<h3>'+c.n+'</h3><p class="wp">'+sp.n+'<i>虹</i></p>'+
   '<p class="ds">'+c.desc+'</p><p class="bn">'+c.bonus+'</p>';
  d.onclick=()=>{selChar=c.id;buildCharCards();};
  wrap.appendChild(d);
 });
}
function buildCodex(){
 const box=$('#codexList');
 const rf=$('#fRank').value, tf=$('#fType').value, q=$('#fQ').value.trim();
 let html='',n=0;
 SPECIALS.forEach(s=>{
  if(rf!=='all'&&rf!=='6')return;
  if(tf!=='all'&&tf!==s.t)return;
  if(q&&s.n.indexOf(q)<0)return;
  n++;
  html+='<div class="row sp"><span class="rk" style="background:linear-gradient(90deg,#ff6b6b,#ffd166,#7CFFB2,#7fd8ff,#b28dff)"></span>'+
   '<div><b>'+s.n+'</b> <em>'+(s.t==='m'?'近接':'遠距離')+'／攻撃'+s.d+(s.boss?'／ボスドロップ':'／キャラ武器')+'</em><p>'+s.desc+'</p></div></div>';
 });
 for(let r=6;r>=0;r--){
  if(rf!=='all'&&+rf!==r)continue;
  BASES.forEach((b,i)=>{
   if(tf!=='all'&&tf!==b.t)return;
   const nm=RANKS[r].pre+'・'+b.n;
   if(q&&nm.indexOf(q)<0)return;
   n++;
   if(n>620)return;
   const col=r===6?'linear-gradient(90deg,#ff6b6b,#ffd166,#7CFFB2,#7fd8ff)':RANKS[r].c;
   html+='<div class="row"><span class="rk" style="background:'+col+'"></span>'+
    '<div><b>'+nm+'</b> <em>'+(b.t==='m'?'近接':'遠距離')+'／攻撃'+Math.round(b.d*RANKS[r].m)+'</em><p>'+b.desc+'</p></div></div>';
  });
 }
 box.innerHTML=html||'<p class="none">条件に合う武器がありません。</p>';
 $('#codexCount').textContent=n+' 件表示中（全 '+(BASES.length*7+SPECIALS.length)+' 種）';
}
function startGame(exp){
 expMode=exp?1:0;
 $('#menu').style.display='none';
 $('#over').style.display='none';
 gameOver=0;gt=0;timeAlive=0;killsTotal=0;bullets=[];fx=[];dmgTexts=[];feed=[];hazards=[];strikes=[];
 genWorld();buildMinimap();spawnAll(selChar);
 started=1;last=0;
 if(expMode)addFeed('実験モード：CPUなし・無敵・スロット10','#ffb0e0');
 else addFeed('100人のバトルが始まった。5秒間は全員無敵','#7fd8ff');
}
function init(){
 cv=$('#cv');ctx=cv.getContext('2d');
 const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};
 addEventListener('resize',rs);rs();
 bindCanvas();
 buildCharCards();
 $('#btnStart').onclick=()=>startGame(0);
 $('#btnAgain').onclick=()=>startGame(expMode);
 // 実験モード（パスワード）
 const pw=$('#expPw'),msg=$('#expMsg');
 const tryExp=()=>{
  if(pw.value==='monoshirikunn'){msg.textContent='解除しました。開始します。';msg.style.color='#7CFFB2';setTimeout(()=>startGame(1),350);}
  else{msg.textContent='パスワードが違います。';msg.style.color='#ff8a8a';}
 };
 $('#btnExp').onclick=tryExp;
 pw.addEventListener('keydown',ev=>{if(ev.key==='Enter')tryExp();});
 $('#btnMenu').onclick=()=>{$('#over').style.display='none';$('#menu').style.display='block';started=0;};
 $('#btnCodex').onclick=()=>{$('#codex').style.display='flex';buildCodex();};
 $('#btnCloseCodex').onclick=()=>{$('#codex').style.display='none';};
 ['fRank','fType'].forEach(id=>$('#'+id).onchange=buildCodex);
 $('#fQ').oninput=buildCodex;
 requestAnimationFrame(loop);
}
document.addEventListener('DOMContentLoaded',init);
