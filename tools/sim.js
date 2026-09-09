#!/usr/bin/env node
/**
 * ヘッドレス・シミュレーター
 *   node tools/sim.js [試合数]
 * ブラウザなしで game.js のロジックだけを走らせ、
 *  ・全500種の武器が例外なく撃てるか
 *  ・試合がちゃんと決着するか（最後の1人まで減るか）
 *  ・1試合あたりの所要時間
 * を検証する。ゲームのバランスやAIをいじったら必ず実行すること。
 */
const fs = require('fs');
const path = require('path');

const STUB = `
global.window = {};
global.innerWidth = 1280; global.innerHeight = 720;
global.addEventListener = () => {};
const _el = { style:{}, innerHTML:'', textContent:'', value:'all',
  appendChild(){}, addEventListener(){}, onclick:null, dataset:{},
  classList:{ add(){}, remove(){} } };
global.document = {
  querySelector: () => _el,
  addEventListener: () => {},
  createElement: () => ({ width:0, height:0, getContext: () => ({
    createImageData: (w,h) => ({ data: new Uint8ClampedArray(w*h*4) }),
    putImageData(){}
  })})
};
`;

const HARNESS = `
// ---- 1. 全武器の発射テスト ----
genWorld(); buildMinimap(); spawnAll('kni'); started = 1;
let err = 0;
for (let i = 0; i < BASES.length; i++) for (let r = 0; r < 7; r++) {
  player.wp[0] = makeWeapon(i, r); player.hp = 9999; player.max = 9999; player.ammo = 999;
  try { for (let k = 0; k < 3; k++) { player.cool = 0; fire(player); updateBullets(16); } }
  catch (e) { console.log('  ERR', BASES[i].n, RANKS[r].k, e.message); err++; }
}
for (const s of SPECIALS) {
  player.wp[0] = makeSpecial(s.id); player.ammo = 999; player.elem = 0;
  try { for (let k = 0; k < 4; k++) { player.cool = 0; player.charge = 900; fire(player); updateBullets(16); player.elem = (player.elem+1)%4; } }
  catch (e) { console.log('  ERR', s.id, e.message); err++; }
}
console.log('武器総数 ' + (BASES.length*7 + SPECIALS.length) + ' 種（基礎' + BASES.length + '×7ランク + 特別' + SPECIALS.length + '）／例外 ' + err + ' 件');

// ---- 2. 試合の通しシミュレーション ----
const RUNS = Number(process.argv[2] || 5);
let fin = 0; const mins = [];
for (let run = 0; run < RUNS; run++) {
  gt = 0; bullets = []; fx = []; dmgTexts = []; drops = []; gameOver = 0;
  genWorld(); buildMinimap(); spawnAll('kni'); started = 1;
  player.bot = 1;               // プレイヤー枠もCPUとして動かす
  let m = 0;
  while (alive > 1 && m < 20) {
    for (let f = 0; f < 3750; f++) {   // 3750フレーム = 約1分
      gt += 16;
      for (const e of ents) updateEnt(e, 16);
      for (const b of bossList) updateBoss(b, 16);
      updateBullets(16); updateHazards(16);
      for (let i = fx.length-1; i >= 0; i--) { fx[i].l -= 16; if (fx[i].l <= 0) fx.splice(i,1); }
      for (let i = dmgTexts.length-1; i >= 0; i--) { dmgTexts[i].l -= 16; if (dmgTexts[i].l <= 0) dmgTexts.splice(i,1); }
      if (drops.length > 420) drops.splice(0, 120);
    }
    m++;
  }
  if (alive <= 1) fin++;
  mins.push(m);
  const win = ents.find(e => e.alive);
  console.log('試合' + (run+1) + ': ' + m + '分／' + (alive <= 1 ? '決着' : '未決着（残り' + alive + '人）') +
    (win ? '　勝者 ' + win.name + '(' + win.ch.n + ') ' + win.kills + 'キル' : '') +
    '　ボス撃破 ' + bossList.filter(b => !b.alive && !b.clone).length + '/4');
}
console.log('---');
console.log('決着 ' + fin + '/' + RUNS + '　平均試合時間 ' + (mins.reduce((a,b)=>a+b,0)/RUNS).toFixed(1) + '分');
if (err > 0 || fin < RUNS) { console.log('要修正: 例外またはハマりが残っている'); process.exit(1); }
console.log('OK');
`;

const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'game.js'), 'utf8');
new Function(STUB + src + HARNESS)();
