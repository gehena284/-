const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');

let gameStarted = false;

// プレイヤーの設定
let x = 200, y = 200;
let s = 5;
const keys = {};

let hp = 100;
let invincible = 0; 

// エネミー（赤い円）の設定
let rx = 500, ry = 300;
let dx = 3, dy = 2;
const r = 20;
let enemyhp = 200;

// 弾丸の設定
const bullets = []; 
const bulletSpeed = 7; 
let shotInterval = 0; 

const enemyBullets = [];
const enemyShotIntervalMax = 60;
let enemyShotInterval = 0;

// 画像の読み込み
const playerImg = new Image();
playerImg.src = "player.png"; 
const playerSize = 50; // 見た目サイズを調整（110だと当たり判定に対して大きすぎるため）

// キー入力イベント（修正点：toLowerCase()をここで行うと効率的）
window.onkeydown = window.onkeyup = e => {
  keys[e.key.toLowerCase()] = e.type === 'keydown';
};

c.addEventListener("click", () => {
  if(!gameStarted) gameStarted = true;
});

function loop() {
  ctx.clearRect(0, 0, c.width, c.height);

  if (!gameStarted) {
    ctx.fillStyle = "black";
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CLICK TO START", c.width / 2, c.height / 2);
    requestAnimationFrame(loop);
    return;
  }

  // --- 1. 移動処理 ---
  if (keys.arrowup) y -= s;
  if (keys.arrowdown) y += s;
  if (keys.arrowleft) x -= s;
  if (keys.arrowright) x += s;

  x = Math.max(r, Math.min(c.width - r, x));
  y = Math.max(r, Math.min(c.height - r, y));

  // --- 2. 弾丸の発射処理 ---
  if (shotInterval <= 0) {
    let fired = false;
    if (keys.w) { bullets.push({ bx: x, by: y, vx: 0, vy: -bulletSpeed }); fired = true; }
    else if (keys.s) { bullets.push({ bx: x, by: y, vx: 0, vy: bulletSpeed }); fired = true; }
    else if (keys.a) { bullets.push({ bx: x, by: y, vx: -bulletSpeed, vy: 0 }); fired = true; }
    else if (keys.d) { bullets.push({ bx: x, by: y, vx: bulletSpeed, vy: 0 }); fired = true; }
    
    if (fired) shotInterval = 10;
  }
  if (shotInterval > 0) shotInterval--;

  // --- 3. エネミーの移動処理 ---
  if (Math.random() < 0.04) {
    dx = (Math.random() - 0.5) * 10;
    dy = (Math.random() - 0.5) * 10;
  }

  const angle = Math.atan2(y - ry, x - rx);
  const chaseForce = 0.2; 
  dx += Math.cos(angle) * chaseForce;
  dy += Math.sin(angle) * chaseForce;

  const speed = Math.hypot(dx, dy);
  if (speed > 5) {
    dx = (dx / speed) * 5;
    dy = (dy / speed) * 5;
  }

  rx += dx;
  ry += dy;

  // 壁跳ね返り
  if (rx <= r || rx >= c.width - r) dx *= -1;
  if (ry <= r || ry >= c.height - r) dy *= -1;

  // エネミーの弾発射
  if (enemyShotInterval <= 0) {
    enemyBullets.push({ bx: rx, by: ry, vx: 5, vy: 0 }, { bx: rx, by: ry, vx: -5, vy: 0 }, { bx: rx, by: ry, vx: 0, vy: 5 }, { bx: rx, by: ry, vx: 0, vy: -5 });
    enemyShotInterval = enemyShotIntervalMax;
  }
  enemyShotInterval--;

  // --- 4. 弾の更新と当たり判定 ---
  
  // プレイヤーの弾
  ctx.fillStyle = 'black';
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.bx += b.vx; b.by += b.vy;
    ctx.beginPath();
    ctx.arc(b.bx, b.by, 5, 0, Math.PI * 2);
    ctx.fill();

    if (Math.hypot(b.bx - rx, b.by - ry) < r + 5) {
      enemyhp -= 5;
      bullets.splice(i, 1);
      rx += (Math.random() - 0.5) * 20; // 簡易ノックバック
      continue;
    }
    if (b.bx < 0 || b.bx > c.width || b.by < 0 || b.by > c.height) bullets.splice(i, 1);
  }

  // エネミーの弾
  ctx.fillStyle = 'purple';
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    let b = enemyBullets[i];
    b.bx += b.vx; b.by += b.vy;
    ctx.beginPath();
    ctx.arc(b.bx, b.by, 5, 0, Math.PI * 2);
    ctx.fill();

    if (Math.hypot(b.bx - x, b.by - y) < 15 + 5) { // プレイヤーの当たり判定を15px程度に
      if (invincible <= 0) { hp -= 5; invincible = 30; }
      enemyBullets.splice(i, 1);
      continue;
    }
    if (b.bx < 0 || b.bx > c.width || b.by < 0 || b.by > c.height) enemyBullets.splice(i, 1);
  }

  // プレイヤーとエネミーの接触判定
  if (Math.hypot(x - rx, y - ry) < 30 + r && invincible <= 0) {
    hp -= 10;
    invincible = 30;
  }

  // --- 5. 描画 ---
  if (invincible % 4 < 2) { // 点滅演出
    ctx.drawImage(playerImg, x - playerSize / 2, y - playerSize / 2, playerSize, playerSize);
  }

  ctx.beginPath();
  ctx.arc(rx, ry, r, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();

  if (invincible > 0) invincible--;

  // UI
  ctx.fillStyle = 'black';
  ctx.font = '20px sans-serif';
  ctx.textAlign = "left";
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
