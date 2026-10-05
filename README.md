# Memory Polygon（思い出ポリゴン）

写真に残っている一瞬に、もう一度時間を与える。
1枚の写真と、その日の出来事から、写真に至るまでの時間をPS1風のポリゴン世界で再構成し、
45秒で写真と同じ構図になってシャッターを切る、約60秒の **Memory Movie** を作る試み。

- 構想：`docs/vision.md`
- 今どこにいるか：`docs/roadmap.md`
- やることリスト：`BACKLOG.md`
- ムービーの作り方：`docs/how-to-make-a-movie.md`

## Memory Movie
`movie/index.html?scene=temple`（`hike` / `reykjavik`）で再生できます。
Three.js（r128）を使い、画像や3Dモデルのファイルは使わず、人物も背景もコードで組み立てています。
写真はリポジトリに入れていません。最後に元の写真を並べたいときは、再生ページで端末から選びます（どこにも送信しません）。

動画への書き出し：
```
node tools/render.js --scene temple --out out/temple.mp4
```

## 旧ギャラリー（見本）
Memory Polygon の前に作った、歩ける思い出のローポリシーン集。公開中：https://chickbeans.github.io/Lowpoly/

| シーン | 場所 | ファイル |
|---|---|---|
| 薄氷の海岸 | アイスランド | `iceland.html` |
| エシャ山を望む海辺 | レイキャビク | `reykjavik.html` |
| 芸術科学都市の水の上 | バレンシア | `valencia.html` |
| ヘミスフェリックの瞳の中 | バレンシア | `hemisferic.html` |

操作：十字キー／WASDで歩く、A／スペースでジャンプ、ドラッグで視点、ピンチ／ホイールでズーム、表示モードは初代プレステ風／64風／PS2風。
