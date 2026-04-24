const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');

// 青い円（プレイヤー）の設定
let x = 200, y = 200;
const r = 20, s = 5;
const keys = {};

let hp = 100;
let invincible = 0; // 無敵時間（フレーム）

// 赤い円（オート）の設定
let rx = 3, ry = 300; // 赤い円の初期位置
let dx = 3, dy = 2;    // 赤い円の移動速度（1フレームごとに進む量）

onkeydown = onkeyup = e => keys[e.key] = e.type === 'keydown';

let isColliding = false;

function loop() {
  // --- 1. 青い円の移動処理 ---
  if (keys.ArrowUp) y -= s;
  if (keys.ArrowDown) y += s;
  if (keys.ArrowLeft) x -= s;
  if (keys.ArrowRight) x += s;

  x = Math.max(r, Math.min(c.width - r, x));
  y = Math.max(r, Math.min(c.height - r, y));

  // --- 2. 赤い円の移動処理 ---
 const angle = Math.atan2(y - ry, x - rx);
 const targetDx = Math.cos(angle) * 2.9;
 const targetDy = Math.sin(angle) * 2;

 dx += (targetDx - dx) * 0.1;
 dy += (targetDy - dy) * 0.1;

 rx += dx;
 ry += dy;

  // --- 3. 描画処理 ---
  ctx.clearRect(0, 0, c.width, c.height);

let playercolor = 'blue';

//当たり判定
const dist = Math.hypot(x - rx, y - ry);

if (dist < r * 2) {
  playercolor = 'yellow';

  if (invincible <= 0) {
    hp -= 10;
    invincible = 30; // 約0.5秒（60fps想定）
    console.log("ダメージ!HP:", hp);
  }
}

  // 青い円
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = playercolor;
  ctx.fill();
  ctx.stroke();

  // 赤い円（変数の値を使って描画）
  ctx.beginPath();
  ctx.arc(rx, ry, r, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.stroke();

  rx = Math.max(r, Math.min(c.width - r, rx));
  ry = Math.max(r, Math.min(c.height - r, ry));

  if (invincible > 0) invincible--;

  ctx.fillStyle = 'black';
  ctx.font = '20px sans-serif';
  ctx.fillText("HP: " + hp, 10, 30);

  if (hp <= 0) {
  ctx.fillStyle = 'black';
  ctx.font = '40px sans-serif';
  ctx.fillText("GAME OVER", 100, 200);
  return; // ループ停止
}

  requestAnimationFrame(loop);
}

loop();