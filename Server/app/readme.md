# ディレクトリ構造（構想）

``` text
app/
├─components/
│  ├─ui/          # shadcn/ui
│  ├─error.tsx    # エラー画面
│  └─loading.tsx  # ロード画面
├─config/
│  ├─client.ts    # クライアント側の.env
│  └─server.ts    # サーバー側の.env
├─features/
│  ├─auth/        # 認証関連
│  └─map/         # マップ基本機能
│     ├─view/     # 表示関連
│     ├─edit/     # 編集関連
│     ├─team/     # チーム関連
│     └─tag/      # タグ関連
├─libs/
│  └─supabase/    # Supabase関連
├─routes/         # React Router v7のディレクトリ構造
│  ├─edit
│  └─red
├─types/          # 型関連
├─app.css
├─root.tsx
└─routes.ts
```
