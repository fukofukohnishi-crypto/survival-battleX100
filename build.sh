#!/bin/bash
# index.html / css / js を1枚のHTMLにまとめて dist/ に出力する。
# 配布やオフラインで遊ぶとき用。ふだんの開発には不要。
set -e
mkdir -p dist
python3 - << 'PY'
html = open('index.html').read()
css  = open('css/style.css').read()
js   = open('js/game.js').read()
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="js/game.js"></script>', '<script>\n' + js + '\n</script>')
open('dist/survival-battle-x100.html', 'w').write(html)
PY
echo "dist/survival-battle-x100.html を作成しました"
