/**
 * ⭐ Starlit Puppet Editor v1.0.3
 * アニメーション・再生機能
 */

// ===== 再生/停止 =====
function togglePlayback() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-btn');
    
    if (isPlaying) {
        btn.textContent = '⏸️ 停止';
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(animationLoop);
    } else {
        btn.textContent = '▶️ 再生';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
}

// ===== 停止（先頭に戻る） =====
function stopPlayback() {
    // 再生中なら停止
    if (isPlaying) {
        isPlaying = false;
        const btn = document.getElementById('play-btn');
        btn.textContent = '▶️ 再生';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    // 先頭に戻す
    currentTime = 0;
    
    // キーフレーム補間を適用
    if (typeof applyKeyframeInterpolation === 'function') {
        applyKeyframeInterpolation();
    }
    
    // タイムラインを更新
    if (typeof updatePlayhead === 'function') {
        updatePlayhead();
    }
    
    render();
}

// ===== アニメーションループ =====
function animationLoop(timestamp) {
    if (!isPlaying) return;
    
    const deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    
    currentTime += deltaTime;
    
    // キーフレーム補間を適用
    if (typeof applyKeyframeInterpolation === 'function') {
        applyKeyframeInterpolation();
    }
    
    // タイムラインを更新
    if (typeof updatePlayhead === 'function') {
        updatePlayhead();
    }
    
    render();
    
    animationFrameId = requestAnimationFrame(animationLoop);
}
