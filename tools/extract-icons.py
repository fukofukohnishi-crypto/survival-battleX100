#!/usr/bin/env python3
# 武器アイコンの元画像(assets/source-codex.png)から80個を切り出し、
# 1枚のアトラス画像 assets/weapons.jpg を作り直す。
#   python3 tools/extract-icons.py     ← リポジトリの直下で実行すること
# 並び順は 0-5:キャラ武器 6-9:ボスドロップ 10-44:近接35 45-79:遠距離35。
# game.js の BASES / SPECIALS の順番と一致していないと絵がずれるので注意。
from PIL import Image
import numpy as np, math
src=Image.open('assets/source-codex.png').convert('RGB')
a=np.asarray(src).astype(float)

def cell_bounds(y0,y1,x0,x1,n):
    band=a[y0:y1,x0:x1].mean(axis=2)
    prof=band.max(axis=0)-band.min(axis=0)
    th=np.percentile(prof,14)
    low=prof<th
    grp=[];s=None
    for i,v in enumerate(low):
        if v and s is None:s=i
        elif not v and s is not None:
            if i-s>=2: grp.append((s,i-1))
            s=None
    if s is not None: grp.append((s,len(low)-1))
    # 近いすきま同士をまとめる
    merged=[]
    for g in grp:
        if merged and g[0]-merged[-1][1]<26: merged[-1]=(merged[-1][0],g[1])
        else: merged.append(list(g) if False else (g[0],g[1]))
    W=x1-x0
    inner=[m for m in merged if m[0]>W*0.03 and m[1]<W*0.97]
    cuts=[0]+[int((m[0]+m[1])/2) for m in inner]+[W]
    if len(cuts)-1!=n:   # 検出できなければ等分割
        cuts=[int(W*i/n) for i in range(n+1)]
    return [(x0+cuts[i],x0+cuts[i+1]) for i in range(n)]

# セクション定義： (行の上端, 下端, 左, 右, 個数)
rows=[
 (89,177,10,717,6),        # 基本武器
 (89,177,733,1305,4),      # ボスドロップ
 (250,337,6,1306,12),(366,461,6,1306,12),(493,583,6,1306,11),   # 近接35
 (659,732,6,1306,12),(772,848,6,1306,12),(887,963,6,1306,11),   # 遠距離35
]
icons=[]
for (y0,y1,x0,x1,n) in rows:
    for (cx0,cx1) in cell_bounds(y0,y1,x0,x1,n):
        icons.append(src.crop((cx0,y0,cx1,y1)))
print('切り出した数:',len(icons))

# プラズマボトルレールガンだけ、もう一枚の写真を使う
gun=Image.open('assets/source-railgun.png').convert('RGB')
icons[7]=gun.crop((765,55,1215,830))       # 右側の銃（説明文を含まない範囲）

ICON=96; COLS=10
def keyed(img):
    """暗い背景を透明にして、96px角に収める"""
    a=np.asarray(img).astype(float)
    corners=np.concatenate([a[0:6,0:6].reshape(-1,3),a[0:6,-6:].reshape(-1,3),
                            a[-6:,0:6].reshape(-1,3),a[-6:,-6:].reshape(-1,3)])
    bg=corners.mean(axis=0)
    d=np.abs(a-bg).max(axis=2)
    alpha=np.clip((d-15)/26,0,1)**0.85*255
    rgba=np.dstack([a,alpha]).astype(np.uint8)
    im=Image.fromarray(rgba,'RGBA')
    w,h=im.size; s=min(ICON/w,ICON/h)
    im=im.resize((max(1,int(w*s)),max(1,int(h*s))),Image.LANCZOS)
    out=Image.new('RGBA',(ICON,ICON),(0,0,0,0))
    out.paste(im,((ICON-im.size[0])//2,(ICON-im.size[1])//2))
    return out

cells=[keyed(ic) for ic in icons]
ROWS=(len(cells)+COLS-1)//COLS
sheet=Image.new('RGBA',(COLS*ICON,ROWS*ICON),(0,0,0,0))
for i,c in enumerate(cells): sheet.paste(c,((i%COLS)*ICON,(i//COLS)*ICON))
# 色数を落としてファイルを小さくする（表示は最大46pxなので見た目は変わらない）
sheet.quantize(colors=128,method=Image.FASTOCTREE).save('assets/weapons.png',optimize=True)
import os
print('アトラス:',sheet.size,round(os.path.getsize('assets/weapons.png')/1024),'KB')

# ---- 武器の向きを求める（持っている絵を照準の方向へ回すため） ----
angs=[]
for c in cells:
    arr=np.asarray(c).astype(float)
    alpha=arr[:,:,3]/255.0
    m=alpha>0.35
    ys,xs=np.nonzero(m)
    if len(xs)<20: angs.append(0.0); continue
    w=alpha[m]
    mx,my=(xs*w).sum()/w.sum(),(ys*w).sum()/w.sum()
    X=xs-mx; Y=ys-my
    cov=np.array([[(w*X*X).sum(),(w*X*Y).sum()],[(w*X*Y).sum(),(w*Y*Y).sum()]])/w.sum()
    val,vec=np.linalg.eigh(cov)
    v=vec[:,np.argmax(val)]
    proj=X*v[0]+Y*v[1]; perp=-X*v[1]+Y*v[0]
    hi=proj>proj.max()*0.55; lo=proj<proj.min()*0.55
    def width(sel):
        if sel.sum()<8: return 1e9
        ww=w[sel]; pp=perp[sel]
        return float(np.sqrt((ww*(pp-(ww*pp).sum()/ww.sum())**2).sum()/ww.sum()))
    wp,wn=width(hi),width(lo)
    if abs(wp-wn)/max(wp,wn,1e-6)<0.12:
        if (w*proj**3).sum()<0: v=-v
    elif wp>wn: v=-v
    angs.append(round(float(math.atan2(v[1],v[0])),3))
line='const WANG=['+','.join(str(a) for a in angs)+'];'
print(line)
import re,io
g=open('js/game.js',encoding='utf-8').read()
if 'const WANG=[' in g:
    g=re.sub(r'const WANG=\[[^\]]*\];',line,g)
    open('js/game.js','w',encoding='utf-8').write(g)
    print('js/game.js の WANG を更新しました')
else:
    print('※ js/game.js に WANG が無いので手で貼ってください')
