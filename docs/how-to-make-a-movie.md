# Memory Movie の作り方（作業する人・Claude向け）

## 仕組みの地図
```
movie/
├─ index.html            再生ページ。?scene=名前 でシーンを選ぶ。元写真は端末から選べる（送信しない）
├─ engine/               再生の仕組み（シーンに依存しない）
│   ├─ util.js           小道具（テクスチャ、IK、乱数、補間）
│   ├─ timeline.js       時間割：経路（path）・ポーズ・ランプ・カメラを時刻 t の関数にする
│   ├─ character.js      PS1風の箱キャラ。見た目の指定（look）から組み立てる。ポーズ集 MP.POSES
│   ├─ player.js         台本を読んで世界を作り、renderAt(t) で1コマを描く。シャッター・日付・吹き出し・本物の写真への切り替え
│   └─ audio.js          ブラウザ再生用の音（パッドとシャッター音）
└─ scenes/
    ├─ <名前>-env.js     背景（MP.ENV.<名前>）。建物・地形・空・小物
    └─ <名前>.js         台本（MP.SCENES.<名前>）。人・経路・ポーズ・カメラ・最後の構図
tools/render.js          動画の書き出し・確認用の静止画
```
既存シーン：`temple`（ロンドンの寺院）、`hike`（ハイキング）、`reykjavik`（レイキャビク）。新しいシーンはこれらを手本にする。

## 写真が届いたら
1. 写真とエピソードから読み取る：人数、服（色・形・柄）、髪型と髪色、眼鏡や小物、ポーズ、左右の並び、場所、時間帯と天気。
2. その日の出来事を4〜5場面に分け、0〜40秒に並べる。40〜45秒で写真の位置へ集合。45秒でシャッター。
3. `scenes/<名前>-env.js`（背景）と `scenes/<名前>.js`（台本）を作り、`index.html` に2行足す。
4. 静止画で確認 → 直す → 動画を書き出す（下のコマンド）。
5. 動画をユーザーに送る。本物の写真入りの動画は、本人にだけ渡す。
6. `BACKLOG.md` と `docs/roadmap.md` を更新してコミット。

写真に本人以外が写っていて、公開ページに載せる場合は、了承があるか一度だけ確認する。
有名キャラクター（像・着ぐるみ・ぬいぐるみなど）は、一般的な姿に置き換える。

## 台本（MP.SCENES.<名前>）の主な項目
| 項目 | 意味 |
|---|---|
| `duration` | 長さ（秒）。普通は 60 |
| `environment` | 使う背景の名前（MP.ENV のキー） |
| `caption` | `{ small: 国・地域, big: 地名 }`。現地語・英語のまま |
| `date` | フィルム風の日付。例 `"'26 2 5   11:30"`。なければ出ない |
| `beats` | 再生ページの場面ボタン `[{ t, label }]` |
| `finalShot` | `shutterAt`（普通45）、`camera`（最後の構図）、`reveal: 'photo'` と `revealAt` で本物の写真へ切り替え。写真がなければ「プリント」演出になる |
| `envState` | 時間で出し入れする背景の物。`{ 関数名: [{ t, v }] }`（背景側に同名の関数を用意） |
| `says` | 吹き出し `[{ who, t0, t1, text }]`（`\n` で改行） |
| `cast` | 登場人物（下） |
| `camera` | ショット `[{ t0, t1, from:{pos,tgt,fov}, to:{...}, ease }]`。ショットの境目はカット |

### 登場人物（cast の1人分）
- `look`：見た目。`skin, hair, hairStyle, top, sleeve('long'|'short'), shorts, longPants, skirt, shoes, face{...}`
  - 髪型 `hairStyle`：`shortFringe` `ponytail` `short` `wavy` `shaggy` `long`
  - 帽子 `hat`：`bucket` `cap` `beanie`（`hatColor`）
  - 柄：`topTex`（服の柄）、`topFront`（前面だけ別の柄）、`sleeveTex`、`upperSleeve` / `foreSleeve`（袖の色）、`legLower`（レギンス等の柄）
  - 小物：`bag`（`tote` `backpack` `cross`）、`scarf`（柄のテクスチャ）、`towel`、`watch`、`wristband`、`earrings`
  - 体格：`scale`（身長）、`width`（横幅）、`tilt`（首のかしげ）
  - 顔 `face`：`skin, shade, brow, browRows, lip` と、必要なら `teeth, lash, blush, glasses, noseRing`
- `path`：経路 `[{ t, x, z, y?, yaw?, cut?, ease? }]`
  - 同じ場所のキーが続けば立ち止まる。`cut: true` はその時刻に瞬間移動（カメラのカットに合わせる）
  - `y` は床の高さ（坂・階段・屋上）。`ease: 'linear'` で一定の速さで歩く
  - **同じ時刻のキーを2つ並べない**（0で割ってしまう）。歩く速さは秒速1.1〜1.5mが自然
- `poses`：腕と視線 `[{ t, R, L, look:[左右, 上下] }]`（0.6秒かけて切り替わる）
  - ポーズ名：`idle strap give clasp namaste point_up point_fwd open phone hip peace_up peace_chest peace_cup cup_chest carry eat table`
  - `R` は本人の右手（x がマイナス側）、`L` は左手
- `hold`：手に持つ物 `[{ t, R, L }]`（`cup burger phone tray`）
- `sit`：座る `[{ t, to, dur }]`、`skirt`：腰巻きを巻く `[{ t, to, dur }]`、`bagGoneAt`：荷物を預けた時刻

### 向きと左右のきまり
- `yaw: 0` で +z を向く。最後の構図は、カメラを +z 側に置いて -z を見る形が多い。
- そのときカメラから見て**左にいる人ほど x が小さい**。写真の左右と必ず合わせる（手の左右もここで確認する）。

## 確認と書き出し
```
# 確認用の静止画（指定した秒のコマを並べた1枚）
node tools/render.js --scene reykjavik --stills 3,12,24,44.6,52 --out out/check.png

# 動画（60秒・24fps・音つき。2〜3分かかる）
node tools/render.js --scene reykjavik --out out/reykjavik.mp4

# 最後に本物の写真へ切り替える版（写真はこの書き出しにだけ使う）
node tools/render.js --scene reykjavik --photo /path/to/photo.jpg --out out/reykjavik.mp4
```
`out/` はGitに入らない。Three.js は cdnjs から読むが、ネットワークで弾かれる環境では、npm から取ったコピーを自動で使う。

## よくある失敗
- カメラが建物や家の中に入っている（家の並びの座標を確認する）
- 窓の桟（さん）や柱が、ちょうど人の前に来ている
- 一列で歩く人どうしの間隔が近すぎて重なる（約1m以上あける）
- 建物の入口以外を通って、壁をすり抜けている
- 写真と左右が逆（人の並び、持っている手）
