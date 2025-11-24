/**
 * ⭐ Starlit Puppet Editor v1.8.7
 * メインアプリケーション - 統合・初期化
 * 
 * 新機能:
 * - 口パク機能（LipSync Layer）
 * - まばたき機能（Blink Layer）
 * 
 * 更新内容:
 * - 風揺れの変形曲線を滑らか化
 * - smoothstep/smootherstep補間を実装
 * - メッシュ分割数を増やして自然な変形に
 * - レイヤー順序の修正（上が前面）
 * - 親子関係の表示問題を修正
 * - ピン追加機能を完全実装
 * - 描画位置のずれを修正
 * - ハンドル判定範囲を拡大
 * 
 * モジュール構成:
 * - app.js: メインの統合・初期化
 * - app-core.js: レイヤー管理、描画のコア機能
 * - app-layers.js: レイヤーリスト、フォルダ機能、複数選択、ドラッグ&ドロップ
 * - app-tools.js: ツール機能（回転ハンドル、ポジション）
 * - app-properties.js: プロパティパネルのUI生成と更新
 * - app-windsway.js: 風揺れ機能（完全実装・滑らか化）
 * - app-animation.js: アニメーション・再生機能、口パク・まばたき制御
 */

// ===== グローバル変数 =====
let canvas, ctx;
let layers = [];
let selectedLayerIds = []; // 複数選択対応
let nextLayerId = 1;

// UI要素
let layerList;
let propertiesPanel;

// アニメーション
let isPlaying = false;
let currentTime = 0;
let animationFrameId = null;
let lastFrameTime = 0;

// アンカーポイントモード
let anchorPointPickMode = false;
let anchorPointClickHandler = null;

// ツールモード
let currentTool = 'none'; // 'none', 'rotation', 'position'
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragInitialValue = { x: 0, y: 0, rotation: 0 };

// ドラッグ&ドロップ
let draggedLayerId = null;
let dragOverLayerId = null;

// 口パク・まばたき用
let lipSyncKeyframes = {}; // layerId: [キーフレーム配列]
let blinkKeyframes = {}; // layerId: [キーフレーム配列]

// ===== 初期化 =====
window.addEventListener('DOMContentLoaded', () => {
    // キャンバス初期化
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;
    
    // UI要素取得
    layerList = document.getElementById('layer-list');
    propertiesPanel = document.getElementById('properties-panel');
    
    // レイヤーパネルを明示的に表示
    const layerPanel = document.querySelector('.sidebar-left');
    if (layerPanel) {
        layerPanel.style.display = 'flex';
        layerPanel.style.visibility = 'visible';
        layerPanel.style.opacity = '1';
    }
    
    // レイヤーリストを明示的に表示
    if (layerList) {
        layerList.style.display = 'flex';
        layerList.style.visibility = 'visible';
        layerList.style.opacity = '1';
    }
    
    // WebGL初期化（風揺れエフェクト用）
    initWindShakeWebGL();
    
    // WebGL初期化（揺れモーション用）
    initBounceWebGL();
    
    // WebGL初期化（パペット用）
    initPuppetWebGL();
    
    // タイムライン初期化
    initTimeline();
    
    // レイヤーリスト初期表示
    updateLayerList();
    
    // ボタンコンテナの表示を確保（updateLayerList後に実行）
    setTimeout(() => {
        const buttonContainer = document.getElementById('layer-buttons-container');
        if (buttonContainer) {
            buttonContainer.style.display = 'flex';
            buttonContainer.style.visibility = 'visible';
        }
    }, 100);
    
    // イベントリスナー設定
    setupEventListeners();
    
    // 初期描画
    render();
});

// ===== イベントリスナー =====
function setupEventListeners() {
    // 画像追加
    document.getElementById('add-image-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => {
            for (const file of e.target.files) {
                loadImage(file);
            }
        };
        input.click();
    });
    
    // 再生/停止
    document.getElementById('play-btn').addEventListener('click', togglePlayback);
    
    // 停止（先頭に戻る）
    document.getElementById('stop-btn').addEventListener('click', stopPlayback);
    
    // FPS切り替え
    document.getElementById('fps-24').addEventListener('click', () => setProjectFPS(24));
    document.getElementById('fps-30').addEventListener('click', () => setProjectFPS(30));
    
    // ピン表示切り替え
    document.getElementById('show-pins-checkbox').addEventListener('change', (e) => {
        showPins = e.target.checked;
        updatePinElements(); // ピン要素を更新
    });
    
    // キャンバスマウスイベント
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('click', (e) => {
        // アンカーポイント設定モード（最優先）
        if (anchorPointPickMode) {
            // anchorPointClickHandlerがapp-properties.jsで処理
            return;
        }
        
        // 揺れモーションレイヤーのアンカーポイント設定モード
        if (typeof bounceAnchorClickMode !== 'undefined' && bounceAnchorClickMode) {
            handleBounceAnchorClick(e);
            return;
        }
        
        // 揺れモーション用ピンモード
        if (typeof bouncePinMode !== 'undefined' && bouncePinMode) {
            addBouncePinToCanvas(e);
            return;
        }
        
        // パペットハンドルアンカー設定モード
        if (typeof puppetHandleMode !== 'undefined' && puppetHandleMode) {
            setPuppetHandleAnchor(e);
            return;
        }
        
        // パペット中間ピン追加モード
        if (typeof puppetIntermediatePinMode !== 'undefined' && puppetIntermediatePinMode) {
            addIntermediatePin(e);
            return;
        }
        
        // パペット固定ピン追加モード
        if (typeof puppetFixedPinMode !== 'undefined' && puppetFixedPinMode) {
            addFixedPin(e);
            return;
        }
        
        // 風揺れピンモード
        if (pinMode) {
            addPinToCanvas(e);
            return;
        }
    });
    document.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('mousemove', (e) => {
        if (typeof handlePuppetDrag === 'function') {
            handlePuppetDrag(e);
        }
    });
    document.addEventListener('mouseup', handleCanvasMouseUp);
    document.addEventListener('mouseup', () => {
        if (typeof handlePuppetDragEnd === 'function') {
            handlePuppetDragEnd();
        }
    });
}
