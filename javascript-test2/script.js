const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');

// 青い円（プレイヤー）の設定
let x = 200, y = 200;
const r = 20, s = 5;
const keys = {};

let hp = 100;
let invincible = 0; 

// 赤い円（オート）の設定
let rx = 3, ry = 300;
let dx = 3, dy = 2;
let enemyhp = 100; // エネミーのHP

// --- 追加：弾丸の設定 ---
const bullets = []; // 弾丸を格納する配列
const bulletSpeed = 7; // 弾の速さ
let shotInterval = 0; // 連射制限用

onkeydown = onkeyup = e => keys[e.key] = e.type === 'keydown';

function loop() {
  // --- 1. 移動処理 ---
  if (keys.ArrowUp) y -= s;
  if (keys.ArrowDown) y += s;
  if (keys.ArrowLeft) x -= s;
  if (keys.ArrowRight) x += s;

  x = Math.max(r, Math.min(c.width - r, x));
  y = Math.max(r, Math.min(c.height - r, y));

  // --- 2. 弾丸の発射処理 (Spaceキー) ---
  if (keys[' '] && shotInterval <= 0) {
    bullets.push({ bx: x, by: y }); // プレイヤーの位置から発射
    shotInterval = 10; // 次の弾まで10フレーム待つ
  }
  if (shotInterval > 0) shotInterval--;

  // --- 3. エネミーの移動処理 ---
  const angle = Math.atan2(y - ry, x - rx);
  const targetDx = Math.cos(angle) * 2.9;
  const targetDy = Math.sin(angle) * 2;
  dx += (targetDx - dx) * 0.1;
  dy += (targetDy - dy) * 0.1;
  rx += dx;
  ry += dy;
  rx = Math.max(r, Math.min(c.width - r, rx));
  ry = Math.max(r, Math.min(c.height - r, ry));

  // --- 4. 当たり判定と描画 ---
  ctx.clearRect(0, 0, c.width, c.height);

  // 弾丸の移動とエネミーへの当たり判定
  ctx.fillStyle = 'black';
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.bx += bulletSpeed; // 右方向に飛ぶ（必要に応じて方向は変えられます）

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
      rx += Math.cos(angle) * -30;
      ry += Math.sin(angle) * -30;

      continue;
    }

    // 画面外に出たら消す
    if (b.bx > c.width) bullets.splice(i, 1);
  }

  // プレイヤーとエネミーの接触判定
  let playercolor = 'blue';
  const distP = Math.hypot(x - rx, y - ry);
  if (distP < r * 2) {
    playercolor = 'yellow';
    if (invincible <= 0) {
      hp -= 10;
      invincible = 30;
    }
  }

  // 青い円（プレイヤー）
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = playercolor;
  ctx.fill();
  ctx.stroke();

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
