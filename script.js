const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');

let gameStarted = false;

// 青い円（プレイヤー）の設定
let x = 200, y = 200;
let s = 5;
const keys = {};

let hp = 100;
let invincible = 0; 

// 赤い円（オート）の設定
let rx = 4, ry = 300;
let dx = 3, dy = 2;
const r = 20
let enemyhp = 200; // エネミーのHP

// --- 弾丸の設定 ---
const bullets = []; // 弾丸を格納する配列
const bulletSpeed = 7; // 弾の速さ
let shotInterval = 0; // 連射制限用

onkeydown = onkeyup = e => keys[e.key] = e.type === 'keydown';

const enemyBullets = [];
const enemyShotIntervalMax = 60;
let enemyShotInterval = 0;

const playerImg = new Image();
playerImg.src = "player.png"; // ここに画像パス

const playerSize = 110; // 見た目サイズ

c.addEventListener("click", () => {
  gameStarted = true;
});

function loop() {
  if (!gameStarted) {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.fillText("CLICK TO START", 100, 200);
    requestAnimationFrame(loop);
    return;
  }

  

  // --- 1. 移動処理 ---
  if (keys.ArrowUp) y -= s;
  if (keys.ArrowDown) y += s;
  if (keys.ArrowLeft) x -= s;
  if (keys.ArrowRight) x += s;

  x = Math.max(r, Math.min(c.width - r, x));
  y = Math.max(r, Math.min(c.height - r, y));

  // --- 2. 弾丸の発射処理 (Spaceキー) ---
// W（上）
if ((keys['w'] || keys['W']) && shotInterval <= 0) {
  bullets.push({ bx: x, by: y, vx: 0, vy: -bulletSpeed });
  shotInterval = 10;
}

// S（下）
if ((keys['s'] || keys['S']) && shotInterval <= 0) {
  bullets.push({ bx: x, by: y, vx: 0, vy: bulletSpeed });
  shotInterval = 10;
}

// A（左）
if ((keys['a'] || keys['A']) && shotInterval <= 0) {
  bullets.push({ bx: x, by: y, vx: -bulletSpeed, vy: 0 });
  shotInterval = 10;
}

// D（右）
if ((keys['d'] || keys['D']) && shotInterval <= 0) {
  bullets.push({ bx: x, by: y, vx: bulletSpeed, vy: 0 });
  shotInterval = 10;
}
  if (shotInterval > 0) shotInterval--;

// --- 3. エネミーの移動処理 ---

if (Math.random() < 0.04) {
  dx = (Math.random() - 0.5) * 30;
  dy = (Math.random() - 0.5) * 30;
}

// 2. プレイヤーをゆるやかに追尾する要素
const angle = Math.atan2(y - ry, x - rx);
const chaseForce = 0.2; // 追尾の強さ
dx += Math.cos(angle) * chaseForce;
dy += Math.sin(angle) * chaseForce;

// 3. 移動速度が速くなりすぎないように制限
const speed = Math.hypot(dx, dy);
if (speed > 5) {
  dx = (dx / speed) * 5;
  dy = (dy / speed) * 5;
}

// 4. 座標を更新
rx += dx;
ry += dy;

// 5. 画面外に出ないように制限
rx = Math.max(r, Math.min(c.width - r, rx));
ry = Math.max(r, Math.min(c.height - r, ry));

  // --- 敵の弾発射（4方向）---
if (enemyShotInterval <= 0) {
  enemyBullets.push({ bx: rx, by: ry, vx: 5, vy: 0 });  // 右
  enemyBullets.push({ bx: rx, by: ry, vx: -5, vy: 0 }); // 左
  enemyBullets.push({ bx: rx, by: ry, vx: 0, vy: 5 });  // 下
  enemyBullets.push({ bx: rx, by: ry, vx: 0, vy: -5 }); // 上
  enemyBullets.push({ bx: rx, by: ry, vx: -3.5, vy: -3.5 }); 
  enemyBullets.push({ bx: rx, by: ry, vx: -3.5, vy: 3.5 }); 
  enemyBullets.push({ bx: rx, by: ry, vx: 3.5, vy: -3.5 }); 
  enemyBullets.push({ bx: rx, by: ry, vx: 3.5, vy: 3.5 }); 

  enemyShotInterval = enemyShotIntervalMax;
}
enemyShotInterval--;

  // --- 4. 当たり判定と描画 ---
  ctx.clearRect(0, 0, c.width, c.height);

  // 弾丸の移動とエネミーへの当たり判定
  ctx.fillStyle = 'black';
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
   b.bx += b.vx;
   b.by += b.vy;

    // 弾の描画
    ctx.beginPath();
    ctx.arc(b.bx, b.by, 5, 0, Math.PI * 2);
    ctx.fill();

    // エネミーとの当たり判定
    const distE = Math.hypot(b.bx - rx, b.by - ry);
    if (distE < r + 5) {
      enemyhp -= 5;   // エネミーにダメージ
      bullets.splice(i, 1); // 弾を消す

        // ノックバック
      const hitAngle = Math.atan2(ry - b.by, rx - b.bx);
      rx += Math.cos(hitAngle) * 10;
      ry += Math.sin(hitAngle) * 10;

      continue;
    }

    // 画面外に出たら消す
  if (
  b.bx < 0 || b.bx > c.width ||
  b.by < 0 || b.by > c.height
) {
  bullets.splice(i, 1);
}
  }

    //球の描写
  ctx.fillStyle = 'purple';
 for (let i = enemyBullets.length - 1; i >= 0; i--) {
  let b = enemyBullets[i];

  b.bx += b.vx;
  b.by += b.vy;

  ctx.beginPath();
  ctx.arc(b.bx, b.by, 5, 0, Math.PI * 2);
  ctx.fill();

  // プレイヤーとの当たり判定
  const dist = Math.hypot(b.bx - x, b.by - y);
  if (dist < r + 5) {
    if (invincible <= 0) {
      hp -= 5;
      invincible = 30;
    }
    enemyBullets.splice(i, 1);
    continue;
  }

  // 画面外削除
  if (
    b.bx < 0 || b.bx > c.width ||
    b.by < 0 || b.by > c.height
  ) {
    enemyBullets.splice(i, 1);
  }
}

  // プレイヤーとエネミーの接触判定
    const playerRadius = playerSize / 2;
    const distP = Math.hypot(x - rx, y - ry);
    if (distP < playerRadius + r) {
    if (invincible <= 0) {
      hp -= 10;
      invincible = 30;
    }
  }

  // プレイヤー
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
  playerImg,
  x - playerSize / 2,
  y - playerSize / 2,
  playerSize,
  playerSize
);

  // 赤い円（エネミー）
  ctx.beginPath();
  ctx.arc(rx, ry, r, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.stroke();

  if (invincible > 0) invincible--;

  // UI表示
  ctx.fillStyle = 'black';
  ctx.font = '20px sans-serif';
  ctx.fillText("PLAYER HP: " + hp, 10, 30);
  ctx.fillText("ENEMY HP: " + enemyhp, 10, 60);

  // 終了判定
  if (hp <= 0) {
    ctx.font = '40px sans-serif';
    ctx.fillText("GAME OVER", 100, 200);
    return; 
  }
  if (enemyhp <= 0) {
    ctx.font = '70px sans-serif';
    ctx.fillText("YOU WIN", 100, 200);
    return; 
  }

  requestAnimationFrame(loop);
}
loop();
