# ディレクトリ構造（構想）

``` text
app/
├── components/
│   ├── ui/              # shadcn/ui
│   ├── error.tsx        # エラー画面
│   └── loading.tsx      # ロード画面
│
├── config/
│   ├── client.ts        # クライアント側の.env
│   └── server.ts        # サーバー側の.env
│
├── features/
│   ├── auth/            # 認証関連
│   │   ├── components/
│   │   └── utils/
│   │
│   └── map/             # マップ基本機能
│       ├── view/        # 表示関連
│       │   ├── components/
│       │   └── utils/
│       │
│       ├── edit/        # 編集関連
│       │   ├── components/
│       │   └── utils/
│       │
│       ├── team/        # チーム関連
│       │   ├── components/
│       │   └── utils/
│       │
│       └── tag/         # タグ関連
│           ├── components/
│           └── utils/
│
├── libs/                 # ライブラリ関連
│   └── supabase/        # Supabase関連
│
├── routes/               # React Router v7のディレクトリ構造
│   ├── edit/
│   ├── edge/
│   └── red/
│
├── types/                # 型関連
├── utils/                # ロジック関連（グローバル）
│
├── app.css
├── root.tsx
└── routes.ts
```
