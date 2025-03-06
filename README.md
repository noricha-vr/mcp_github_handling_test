# mcp_github_handling_test

## 概要
これはGitHub APIのテスト用リポジトリです。GitHub APIの動作確認や機能テストのために作成されました。

## 機能
- 基本的なGitHub操作の検証
- リポジトリ管理機能のテスト
- 各種APIの動作確認
- GitHub Pages自動デプロイ

## ゲーム
このリポジトリには以下のブラウザゲームが含まれています：
1. **スネークゲーム** - 古典的なスネークゲームの実装 (index.htmlとsnake.js)
2. **テトリスゲーム** - クラシックなテトリスゲームの実装 (tetris.htmlとtetris.js)

## GitHub Pages
このリポジトリは自動的にGitHub Pagesにデプロイされます。以下のURLからアクセスできます：
- https://noricha-vr.github.io/mcp_github_handling_test/

## 使い方
このリポジトリは以下のように利用できます：
1. リポジトリをクローン: `git clone https://github.com/noricha-vr/mcp_github_handling_test.git`
2. 必要な変更を加える
3. 変更をプッシュして動作を確認
4. main ブランチへの変更は自動的にGitHub Pagesにデプロイされます

## ファイル構成
- `index.html` - スネークゲームのメインページ
- `snake.js` - スネークゲームのロジック
- `tetris.html` - テトリスゲームのページ
- `tetris.js` - テトリスゲームのロジック
- `.nojekyll` - GitHub Pagesの設定ファイル
- `.github/workflows/pages.yml` - GitHub Pages デプロイ用の GitHub Actions ワークフロー

## 操作方法
### スネークゲーム
- 矢印キーで蛇を操作
- モバイルではスクリーン上のボタンを使用

### テトリスゲーム
- 左右矢印キー: ブロックを左右に移動
- 下矢印キー: ブロックを下に移動（ソフトドロップ）
- 上矢印キー: ブロックを回転
- スペースキー: ブロックを一気に落下（ハードドロップ）
- モバイルではスクリーン上のボタンを使用

## 貢献方法
テスト目的のリポジトリのため、特別な貢献ガイドラインはありません。

## ライセンス
MITライセンス
