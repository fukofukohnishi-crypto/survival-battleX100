#!/bin/bash
# index.html / css / js / 武器アイコン画像 を1枚のHTMLにまとめて dist/ に出力する。
# 配布やオフラインで遊ぶとき用。ふだんの開発には不要。
set -e
mkdir -p dist
python3 - << 'PY'
import base64
html = open('index.html').read()
css  = open('css/style.css').read()
js   = open('js/game.js').read()
img  = base64.b64encode(open('assets/weapons.png','rb').read()).decode()
uri  = 'data:image/png;base64,' + img
# 画像は1枚しかないので、参照している場所をすべて埋め込みに置き換える
css = css.replace('url(../assets/weapons.png)', 'url(' + uri + ')')
js  = js.replace("atlas.src='assets/weapons.png';", "atlas.src='" + uri + "';")
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="js/game.js"></script>', '<script>\n' + js + '\n</script>')
open('dist/survival-battle-x100.html', 'w').write(html)
PY
echo "dist/survival-battle-x100.html を作成しました（$(du -h dist/survival-battle-x100.html | cut -f1)）"
