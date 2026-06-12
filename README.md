# バット工房 ⚾ Bat Craft Baseball

3D野球ミニゲーム「バット工房 ⚾ Bat Craft Baseball」のコードベースリファクタリングおよび衝突判定の実装プロジェクトです。

## プロジェクト構成

- [index.html](file:///Users/suekane/Desktop/Coding/Bat/index.html): メインゲームファイル（HTML + CSS + JavaScript / Three.js r128）
- [refactor-instructions.md](file:///Users/suekane/Desktop/Coding/Bat/refactor-instructions.md): 技術的負債の解消とリファクタリングに関する指示書

## ゲームの仕様と座標系

- **原点**: ホームベース
- **Z軸**: 投手方向が `-Z`。センターが Z軸負の方向（`-Z`）、キャッチャー/バックネット側が `+Z`。
- **X軸**: 三塁側が `-X`、一塁側が `+X`。
- **フェア判定**: 打球角度 `|spray| <= 46°` かつ `z < 0` (前方)。
- **バットデータ**: radii[] 配列がグリップ端（index 0）からバレル端（index 56）までの半径を保持。

## 起動方法

以下のコマンドを実行して開発サーバーを立ち上げ、ブラウザでアクセスします。
```bash
python3 -m http.server 8765
```
URL: `http://localhost:8765`

## 検証方法

### 構文チェック
```bash
awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f' index.html > bat_check.js
node --check bat_check.js
rm bat_check.js
```

### スモークテスト
自動打席スクリプトによるテスト手順は [docs/smoke-test.md](file:///Users/suekane/Desktop/Coding/Bat/docs/smoke-test.md) を参照してください。
