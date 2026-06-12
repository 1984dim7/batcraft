# Smoke Test & Memory Profiling Guide

このゲームには自動打席シミュレータとメモリプロファイラが組み込まれています。ブラウザのDevToolsコンソールで実行して回帰バグがないか検証できます。

## 1. 自動打撃スモークテスト

以下のスクリプトをDevToolsコンソールに貼り付けると、自動的にテスト用のバットが成形され、ゲームモードで10球スイングします。

```js
(() => {
  const b = window.__bat, SEG = b.radii.length - 1;
  // 1) テスト用バット成形
  for (let i = 0; i <= SEG; i++) {
    const t = i/SEG;
    b.radii[i] = 0.014 + 0.0195 * (t < 0.45 ? Math.pow(t/0.45, 1.8)*0.25 : 0.25 + 0.75*Math.min((t-0.45)/0.4, 1));
  }
  b.rebuild();
  b.toGame();

  // 2) 自動スイングで10球回す
  const swingT = b.batStats().swingT;
  let armed = false;
  window.__sim = setInterval(() => {
    const st = b.state();
    if (st.mode==='game' && st.pitching && st.tLeft !== null && !armed) {
      armed = true;
      const t = st.ballTarget, delay = Math.max(0, (st.tLeft - (0.42*swingT - 0.007))*1000);
      setTimeout(() => {
        b.setAim((t[0] + 0.92 - 0.56)/0.30, 1 - (t[1] - 0.50)/0.87);
        b.startSwing();
        setTimeout(() => armed = false, 1200);
      }, delay);
    }
  }, 8);
})();
```

### 終了時の確認
約60秒後、全投球が終了したらコンソールで以下を実行し、結果を確認します：
```js
clearInterval(window.__sim);
console.log(window.__bat.state());
```

**期待値（Baseline実績）:**
- 10球中コンタクト数: 9〜10回
- ヒット＋HRの合計数: 6〜9回
- 最長飛距離: 100〜140m
- 終了画面（リザルトパネル）が表示されていること

---

## 2. GPU リソースリーク計測

モード切替によるジオメトリやテクスチャのリークがないか検証します。

```js
// 1) 初期状態のメモリ取得
console.log("初期メモリ:", window.__bat.info());

// 2) 工房⇄打席を5往復する
for (let i = 0; i < 5; i++) {
  window.__bat.toGame();
  window.__bat.toCraft();
}

// 3) 5往復後のメモリ取得
console.log("5往復後のメモリ:", window.__bat.info());
```

**期待値:**
- リファクタリング前（Baseline）: `geometries` が往復のたびに単調増加する（リーク）。
- リファクタリング後: `geometries` と `textures` が往復前後でほぼ一定になる。
