document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const dropBtn = document.getElementById('dropBtn');

    // ゲーム設定
    const gridSize = 30;
    const boardWidth = 10;
    const boardHeight = 20;
    
    // ゲーム状態
    let gameStarted = false;
    let gameOver = false;
    let score = 0;
    let level = 1;
    let lines = 0;
    let dropInterval = 1000; // 初期のドロップ速度（ms）
    let lastTime = 0;
    let dropCounter = 0;
    
    // ゲームボード (0=空き, 1-7=テトリミノのタイプ)
    let board = createEmptyBoard();
    
    // 現在のテトリミノ
    let currentPiece = null;
    let nextPiece = null;
    
    // テトリミノの色
    const colors = [
        null,
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF'  // Z
    ];
    
    // テトリミノの形状定義
    const pieces = [
        null,
        // I
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // J
        [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ],
        // L
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ],
        // O
        [
            [4, 4],
            [4, 4]
        ],
        // S
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        // T
        [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ],
        // Z
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]
    ];
    
    // 空のボードを作成
    function createEmptyBoard() {
        return Array(boardHeight).fill().map(() => Array(boardWidth).fill(0));
    }
    
    // テトリミノを生成
    function createPiece(type) {
        return {
            pos: {x: boardWidth / 2 - 2, y: 0},
            type: type,
            matrix: pieces[type],
            ghost: false
        };
    }
    
    // ランダムなテトリミノを生成
    function randomPiece() {
        // 1-7までのランダムな数字を生成
        const type = Math.floor(Math.random() * 7) + 1;
        return createPiece(type);
    }
    
    // テトリミノの衝突検出
    function collide(piece, board) {
        const m = piece.matrix;
        const pos = piece.pos;
        
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (board[y + pos.y] === undefined ||
                     board[y + pos.y][x + pos.x] === undefined ||
                     board[y + pos.y][x + pos.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // テトリミノをボードにマージ
    function merge(piece, board) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
    }
    
    // テトリミノを回転
    function rotate(matrix, dir) {
        // 行と列を転置
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
        
        // 行を逆順にする（時計回り）または列を逆順にする（反時計回り）
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    // テトリミノの回転とウォールキック
    function playerRotate(dir) {
        if (!gameStarted || gameOver) return;
        
        const pos = currentPiece.pos.x;
        let offset = 1;
        rotate(currentPiece.matrix, dir);
        
        // 回転後に衝突する場合、ウォールキックを試みる
        while (collide(currentPiece, board)) {
            currentPiece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > currentPiece.matrix[0].length) {
                rotate(currentPiece.matrix, -dir);
                currentPiece.pos.x = pos;
                return;
            }
        }
        
        updateGhost();
    }
    
    // テトリミノを左右に移動
    function playerMove(dir) {
        if (!gameStarted || gameOver) return;
        
        currentPiece.pos.x += dir;
        if (collide(currentPiece, board)) {
            currentPiece.pos.x -= dir;
        } else {
            updateGhost();
        }
    }
    
    // テトリミノをソフトドロップ（下に移動）
    function playerDrop() {
        if (!gameStarted || gameOver) return;
        
        currentPiece.pos.y++;
        if (collide(currentPiece, board)) {
            currentPiece.pos.y--;
            merge(currentPiece, board);
            resetPiece();
            clearLines();
            updateScore();
        }
        dropCounter = 0;
    }
    
    // テトリミノをハードドロップ（一気に落下）
    function playerHardDrop() {
        if (!gameStarted || gameOver) return;
        
        while (!collide(currentPiece, board)) {
            currentPiece.pos.y++;
        }
        currentPiece.pos.y--;
        merge(currentPiece, board);
        resetPiece();
        clearLines();
        updateScore();
        dropCounter = 0;
    }
    
    // ゴーストピースの位置を更新
    function updateGhost() {
        // ゴーストピースの位置をリセット
        ghostPiece = {
            pos: {x: currentPiece.pos.x, y: currentPiece.pos.y},
            matrix: [...currentPiece.matrix.map(row => [...row])],
            type: currentPiece.type,
            ghost: true
        };
        
        // ゴーストピースをできるだけ下に移動
        while (!collide(ghostPiece, board)) {
            ghostPiece.pos.y++;
        }
        ghostPiece.pos.y--;
    }
    
    // 新しいテトリミノをセット
    function resetPiece() {
        if (nextPiece === null) {
            currentPiece = randomPiece();
            nextPiece = randomPiece();
        } else {
            currentPiece = nextPiece;
            nextPiece = randomPiece();
        }
        
        // 開始位置でも衝突する場合はゲームオーバー
        if (collide(currentPiece, board)) {
            gameOver = true;
        } else {
            updateGhost();
        }
    }
    
    // 完成したラインを消去
    function clearLines() {
        let linesCleared = 0;
        outer: for (let y = boardHeight - 1; y >= 0; --y) {
            for (let x = 0; x < boardWidth; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // このラインは完成しているので削除
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++; // 次の同じ行も確認するために元に戻す
            
            linesCleared++;
        }
        
        if (linesCleared > 0) {
            lines += linesCleared;
            linesElement.textContent = lines;
            
            // レベルを更新（10ライン消去ごとにレベルアップ）
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                levelElement.textContent = level;
                
                // ドロップ間隔を短くする（速くする）
                dropInterval = Math.max(100, 1000 - (level - 1) * 100);
            }
            
            // スコアを加算（クリアしたライン数に応じてスコア増加）
            score += linesCleared * 100 * level;
            scoreElement.textContent = score;
        }
    }
    
    // スコアの更新
    function updateScore() {
        scoreElement.textContent = score;
    }
    
    // キャンバスをクリア
    function clearCanvas() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // ボードを描画
    function drawBoard() {
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = colors[value];
                    ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
                }
            });
        });
    }
    
    // テトリミノを描画
    function drawPiece(piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    if (piece.ghost) {
                        // ゴーストピースは半透明で描画
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    } else {
                        ctx.fillStyle = colors[value];
                    }
                    ctx.fillRect(
                        (x + piece.pos.x) * gridSize,
                        (y + piece.pos.y) * gridSize,
                        gridSize - 1,
                        gridSize - 1
                    );
                }
            });
        });
    }
    
    // ゲームオーバー画面の描画
    function drawGameOver() {
        clearCanvas();
        drawBoard();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('リセットボタンを押してください', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // スタート画面の描画
    function drawStart() {
        clearCanvas();
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('スタートボタンを押して', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('ゲームを開始してください', canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // ゲームリセット
    function resetGame() {
        board = createEmptyBoard();
        score = 0;
        level = 1;
        lines = 0;
        dropInterval = 1000;
        gameStarted = false;
        gameOver = false;
        scoreElement.textContent = '0';
        levelElement.textContent = '1';
        linesElement.textContent = '0';
        
        currentPiece = null;
        nextPiece = null;
        resetPiece();
        
        clearCanvas();
        drawStart();
    }
    
    // ゲームループ
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        
        if (gameStarted && !gameOver) {
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }
            
            clearCanvas();
            drawBoard();
            drawPiece(ghostPiece);
            drawPiece(currentPiece);
        } else if (gameOver) {
            drawGameOver();
        }
        
        requestAnimationFrame(update);
    }
    
    // キーボード入力の処理
    document.addEventListener('keydown', event => {
        if (gameOver) return;
        
        if (!gameStarted) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
                event.key === 'ArrowDown' || event.key === 'ArrowUp' || 
                event.key === ' ') {
                gameStarted = true;
            }
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                playerMove(-1);
                break;
            case 'ArrowRight':
                playerMove(1);
                break;
            case 'ArrowDown':
                playerDrop();
                break;
            case 'ArrowUp':
                playerRotate(1);
                break;
            case ' ':
                playerHardDrop();
                break;
        }
    });
    
    // ボタン操作
    startBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
    });
    
    resetBtn.addEventListener('click', resetGame);
    
    // モバイルコントロール
    leftBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
        playerMove(-1);
    });
    
    rightBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
        playerMove(1);
    });
    
    downBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
        playerDrop();
    });
    
    rotateBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
        playerRotate(1);
    });
    
    dropBtn.addEventListener('click', () => {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        }
        playerHardDrop();
    });
    
    // ゲームの初期化と開始
    resetGame();
    update();
    
    let ghostPiece = null;
});