#!/usr/bin/env python3
# ボスの絵(assets/source-bosses.png)から4体を切り出し、
# 周囲を透過させた assets/bosses.png（2x2・1枚256px）を作る。
#   python3 tools/extract-bosses.py    ← リポジトリ直下で実行
# 並びは 0:神速の帝王鷹 1:雷霧の巨兵 2:蒼盾の守護者 3:四神の化身（BOSSES と同じ順）
from PIL import Image
import numpy as np, os

src = Image.open('assets/source-bosses.png').convert('RGB')
# BOSSES の順に合わせる（鷹・雷・盾・炎）
boxes = [(975,585,1425,1000),  # 神速の帝王鷹
         (175,45,635,495),      # 雷霧の巨兵
         (150,565,600,1000),    # 蒼盾の守護者
         (915,60,1395,505)]     # 四神の化身
S = 256

def cut(box):
    im = src.crop(box).resize((S,S), Image.LANCZOS)
    a = np.asarray(im).astype(float)
    mx = a.max(axis=2); mn = a.min(axis=2)
    sat = (mx-mn)/(mx+1e-6)
    lum = a.mean(axis=2)/255
    # 光っている主役を残し、暗い背景を消す
    subj = np.clip((sat*0.95 + lum*1.30 - 0.62)*2.8, 0, 1)**0.7
    y, x = np.mgrid[0:S, 0:S]
    r = np.sqrt((x-S/2)**2 + (y-S/2)**2)/(S/2)
    radial = np.clip((1.02-r)/0.26, 0, 1)          # 端を円形にぼかす
    alpha = np.clip(subj*radial, 0, 1)**0.85*255
    a = np.clip((a-16)*1.18+10, 0, 255)            # 小さく表示するので少し明るく
    return Image.fromarray(np.dstack([a, alpha]).astype(np.uint8), 'RGBA')

sheet = Image.new('RGBA', (S*2, S*2), (0,0,0,0))
for i, b in enumerate(boxes):
    sheet.paste(cut(b), ((i%2)*S, (i//2)*S))
sheet.quantize(colors=200, method=Image.FASTOCTREE).save('assets/bosses.png', optimize=True)
print('ボス画像:', sheet.size, round(os.path.getsize('assets/bosses.png')/1024), 'KB')

# 確認用：ゲームと同じ暗い背景に重ねてみる
prev = Image.new('RGB', (S*4, S), (14,20,32))
for i,b in enumerate(boxes):
    c = cut(b); prev.paste(c, (i*S,0), c)
prev.save('/home/claude/boss_check.png')
