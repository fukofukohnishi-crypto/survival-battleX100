# survival-battleX100

Next.js (App Router) + TypeScript + Tailwind CSS のプロジェクト。Vercel へのデプロイを前提にしています。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
```

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド結果を起動 |
| `npm run lint` | ESLint |

## 構成

```
src/app/
  layout.tsx    ルートレイアウト（メタデータ・フォント）
  page.tsx      トップページ
  globals.css   Tailwind のエントリポイント
public/         静的ファイル
```

## Vercel への接続

1. https://vercel.com/new を開く
2. `fukofukohnishi-crypto/survival-battleX100` を Import
3. Framework Preset が **Next.js** になっていることを確認（自動検出されます）
4. Build Command / Output Directory / Install Command はすべて既定のままで OK
5. Deploy

接続後は、Production Branch（既定では `main`）への push で本番デプロイ、それ以外のブランチへの push でプレビューデプロイが自動的に走ります。

環境変数が必要になったら Vercel の Project Settings → Environment Variables に登録し、ローカルでは `.env.local` に置いてください（`.env*` は Git 管理外です）。
