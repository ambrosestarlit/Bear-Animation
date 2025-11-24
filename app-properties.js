/**
 * ⭐ Starlit Puppet Editor v1.8.7
 * プロパティパネル - アンカー設定モードとピンモードの競合を修正
 * - アンカー設定モードとピンモードが互いに無効化するように改善
 * - 風揺れ完全UI実装 + 口パク・まばたき対応 + 揺れモーション分割数調整 + 揺れピン制御
 */

// ===== プロパティパネル更新 =====
function updatePropertiesPanel() {
    // 複数選択時
    if (selectedLayerIds.length > 1) {
        propertiesPanel.innerHTML = `
            <h3>複数選択 (${selectedLayerIds.length}個)</h3>
            <p style="color: var(--biscuit-light); margin-top: 16px;">
                💡 複数のレイヤーが選択されています<br>
                フォルダ作成ボタンでまとめることができます
            </p>
        `;
        clearPinElements();
        if (typeof clearPuppetAnchorElements === 'function') {
            clearPuppetAnchorElements();
        }
        return;
    }
    
    // 未選択時
    if (selectedLayerIds.length === 0) {
        propertiesPanel.innerHTML = '<p>レイヤーが選択されていません</p>';
        clearPinElements();
        if (typeof clearPuppetAnchorElements === 'function') {
            clearPuppetAnchorElements();
        }
        return;
    }
    
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) {
        propertiesPanel.innerHTML = '<p>レイヤーが選択されていません</p>';
        clearPinElements();
        if (typeof clearPuppetAnchorElements === 'function') {
            clearPuppetAnchorElements();
        }
        return;
    }
    
    // パペット以外のレイヤーの場合、パペットアンカー要素をクリア
    if (layer.type !== 'puppet' && typeof clearPuppetAnchorElements === 'function') {
        clearPuppetAnchorElements();
    }
    
    // フォルダの場合
    if (layer.type === 'folder') {
        propertiesPanel.innerHTML = `
            <h3>📁 ${layer.name}</h3>
            <p style="color: var(--biscuit-light); margin-top: 16px; font-size: 11px;">
                💡 フォルダは親レイヤーとして機能します<br>
                フォルダを動かすと親がないレイヤーも一緒に動きます<br>
                ✨ 既存の親子関係は維持されます
            </p>
            
            <div class="property-group">
                <h4>📍 トランスフォーム</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformXValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'x\', parseFloat(this.value))"
                            onchange="updateLayerProperty('x', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                            onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformYValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'y\', parseFloat(this.value))"
                            onchange="updateLayerProperty('y', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                            onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                            min="-360" max="360" step="0.1"
                            oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                            min="0.1" max="3" step="0.01"
                            oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                            onchange="updateLayerProperty('scale', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                            onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        不透明度: <span id="transformOpacityValue">${(layer.opacity * 100).toFixed(0)}%</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.opacity}" 
                            min="0" max="1" step="0.01"
                            oninput="document.getElementById('transformOpacityValue').textContent = (parseFloat(this.value) * 100).toFixed(0) + '%'; updateLayerPropertyLive('opacity', parseFloat(this.value))"
                            onchange="updateLayerProperty('opacity', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${(layer.opacity * 100).toFixed(0)}" step="1" min="0" max="100"
                            onchange="updateLayerProperty('opacity', parseFloat(this.value) / 100); updatePropertiesPanel()">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>🎨 ブレンド</h4>
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">ブレンドモード</label>
                    <select onchange="updateLayerProperty('blendMode', this.value); updatePropertiesPanel()" 
                        style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>通常</option>
                        <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>乗算</option>
                        <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>スクリーン</option>
                        <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>オーバーレイ</option>
                        <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>比較(暗)</option>
                        <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>比較(明)</option>
                        <option value="color-dodge" ${layer.blendMode === 'color-dodge' ? 'selected' : ''}>覆い焼きカラー</option>
                        <option value="color-burn" ${layer.blendMode === 'color-burn' ? 'selected' : ''}>焼き込みカラー</option>
                        <option value="hard-light" ${layer.blendMode === 'hard-light' ? 'selected' : ''}>ハードライト</option>
                        <option value="soft-light" ${layer.blendMode === 'soft-light' ? 'selected' : ''}>ソフトライト</option>
                        <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>差の絶対値</option>
                        <option value="exclusion" ${layer.blendMode === 'exclusion' ? 'selected' : ''}>除外</option>
                        <option value="hue" ${layer.blendMode === 'hue' ? 'selected' : ''}>色相</option>
                        <option value="saturation" ${layer.blendMode === 'saturation' ? 'selected' : ''}>彩度</option>
                        <option value="color" ${layer.blendMode === 'color' ? 'selected' : ''}>カラー</option>
                        <option value="luminosity" ${layer.blendMode === 'luminosity' ? 'selected' : ''}>輝度</option>
                    </select>
                </div>
            </div>
            
            <div class="property-group">
                <h4>🛠️ 操作ツール</h4>
                <div style="display: flex; gap: 8px;">
                    <button id="tool-rotation" onclick="toggleTool('rotation')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        🔁 回転ハンドル
                    </button>
                    <button id="tool-position" onclick="toggleTool('position')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        👇 ポジション
                    </button>
                </div>
                <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 ツールを選択してキャンバスをドラッグ<br>
                    📁 フォルダを動かすと中のレイヤーも一緒に動きます
                </div>
            </div>
            
            ${generateWindSwayUI(layer)}
        `;
        
        updateToolButtons();
        setupWindSwayEventListeners();
        clearPinElements();
        return;
    }
    
    // 画像レイヤーの場合
    if (layer.type === 'image') {
    propertiesPanel.innerHTML = `
        <h3>${layer.name}</h3>
        
        <div class="property-group">
            <h4>📍 トランスフォーム</h4>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                        min="-2000" max="2000" step="1"
                        oninput="document.getElementById(\'transformXValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'x\', parseFloat(this.value))"
                        onchange="updateLayerProperty('x', parseFloat(this.value))">
                    <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                        onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                        min="-2000" max="2000" step="1"
                        oninput="document.getElementById(\'transformYValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'y\', parseFloat(this.value))"
                        onchange="updateLayerProperty('y', parseFloat(this.value))">
                    <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                        onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                        min="-360" max="360" step="0.1"
                        oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                        onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                    <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                        onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                        min="0.1" max="3" step="0.01"
                        oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                        onchange="updateLayerProperty('scale', parseFloat(this.value))">
                    <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                        onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            <div style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    不透明度: <span id="transformOpacityValue">${(layer.opacity * 100).toFixed(0)}%</span>
                </label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="range" class="property-slider" style="flex: 1;" value="${layer.opacity}" 
                        min="0" max="1" step="0.01"
                        oninput="document.getElementById('transformOpacityValue').textContent = (parseFloat(this.value) * 100).toFixed(0) + '%'; updateLayerPropertyLive('opacity', parseFloat(this.value))"
                        onchange="updateLayerProperty('opacity', parseFloat(this.value))">
                    <input type="number" style="width: 80px;" value="${(layer.opacity * 100).toFixed(0)}" step="1" min="0" max="100"
                        onchange="updateLayerProperty('opacity', parseFloat(this.value) / 100); updatePropertiesPanel()">
                </div>
            </div>
        </div>
        
        <div class="property-group">
            <h4>🎨 ブレンド</h4>
            <div style="margin-bottom: 0;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">ブレンドモード</label>
                <select onchange="updateLayerProperty('blendMode', this.value); updatePropertiesPanel()" 
                    style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;">
                    <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>通常</option>
                    <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>乗算</option>
                    <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>スクリーン</option>
                    <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>オーバーレイ</option>
                    <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>比較(暗)</option>
                    <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>比較(明)</option>
                    <option value="color-dodge" ${layer.blendMode === 'color-dodge' ? 'selected' : ''}>覆い焼きカラー</option>
                    <option value="color-burn" ${layer.blendMode === 'color-burn' ? 'selected' : ''}>焼き込みカラー</option>
                    <option value="hard-light" ${layer.blendMode === 'hard-light' ? 'selected' : ''}>ハードライト</option>
                    <option value="soft-light" ${layer.blendMode === 'soft-light' ? 'selected' : ''}>ソフトライト</option>
                    <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>差の絶対値</option>
                    <option value="exclusion" ${layer.blendMode === 'exclusion' ? 'selected' : ''}>除外</option>
                    <option value="hue" ${layer.blendMode === 'hue' ? 'selected' : ''}>色相</option>
                    <option value="saturation" ${layer.blendMode === 'saturation' ? 'selected' : ''}>彩度</option>
                    <option value="color" ${layer.blendMode === 'color' ? 'selected' : ''}>カラー</option>
                    <option value="luminosity" ${layer.blendMode === 'luminosity' ? 'selected' : ''}>輝度</option>
                </select>
            </div>
        </div>
        
        <div class="property-group">
            <h4>🛠️ 操作ツール</h4>
            <div style="display: flex; gap: 8px;">
                <button id="tool-rotation" onclick="toggleTool('rotation')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    🔁 回転ハンドル
                </button>
                <button id="tool-position" onclick="toggleTool('position')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    👇 ポジション
                </button>
            </div>
            <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                💡 ツールを選択してキャンバスをドラッグ<br>
                🔁 回転: アンカーを中心に回転<br>
                👇 ポジション: 画像を移動<br>
                🔄 2回クリックでツール解除
            </div>
        </div>
        
        <div class="property-group">
            <h4>⚓ アンカーポイント</h4>
            <div style="display: flex; gap: 8px;">
                <button onclick="startAnchorPointPick()" style="flex: 1; padding: 8px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🎯 クリックで設定
                </button>
                <button onclick="resetAnchorPoint()" style="flex: 1; padding: 8px; background: var(--chocolate-dark); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ↩️ 中央に戻す
                </button>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <div style="flex: 1;">
                    <label style="font-size: 11px;">X: <span id="anchorXValue">${(layer.anchorX * 100).toFixed(0)}%</span></label>
                    <input type="range" class="property-slider" value="${(layer.anchorX * 100).toFixed(0)}" 
                        min="0" max="100" step="1"
                        oninput="document.getElementById('anchorXValue').textContent = this.value + '%'; setAnchorPointLive('x', parseFloat(this.value) / 100)"
                        onchange="setAnchorPoint('x', parseFloat(this.value) / 100)">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 11px;">Y: <span id="anchorYValue">${(layer.anchorY * 100).toFixed(0)}%</span></label>
                    <input type="range" class="property-slider" value="${(layer.anchorY * 100).toFixed(0)}" 
                        min="0" max="100" step="1"
                        oninput="document.getElementById('anchorYValue').textContent = this.value + '%'; setAnchorPointLive('y', parseFloat(this.value) / 100)"
                        onchange="setAnchorPoint('y', parseFloat(this.value) / 100)">
                </div>
            </div>
            <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                💡 トランスフォーム（回転・スケール）の基準となる点です<br>
                🎯 クリック設定: キャンバスをクリックして関節位置に設定<br>
                ✚ 赤い十字マークが常に表示されます
            </div>
        </div>
        
        ${generatePuppetFollowUI(layer)}
        
        <div class="property-group">
            <h4>🔗 親子関係</h4>
            <label>親レイヤー: 
                <select id="prop-parent" onchange="updateLayerProperty('parentLayerId', this.value ? parseInt(this.value) : null)">
                    <option value="">なし</option>
                    ${layers.filter(l => l.id !== layer.id).map(l => 
                        `<option value="${l.id}" ${l.id === layer.parentLayerId ? 'selected' : ''}>${l.name}</option>`
                    ).join('')}
                </select>
            </label>
        </div>
        
        <div class="property-group">
            <h4>🎭 色抜きクリッピング</h4>
            <label class="checkbox-label" style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer;">
                <input type="checkbox" ${layer.colorClipping && layer.colorClipping.enabled ? 'checked' : ''} 
                    onchange="toggleColorClipping(this.checked)">
                <span style="margin-left: 8px; font-weight: bold;">色抜きクリッピングを有効化</span>
            </label>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">参照レイヤー</label>
                <select id="colorClippingReferenceSelect" style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 8px;">
                    <option value="">なし</option>
                </select>
                <button onclick="setColorClippingReference()" style="width: 100%; padding: 8px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-bottom: 12px;">
                    📌 参照レイヤーを設定
                </button>
            </div>
            
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                <div style="flex: 1;">
                    <div style="font-size: 11px; margin-bottom: 4px;">抽出色:</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div style="width: 50px; height: 50px; border-radius: 4px; border: 2px solid var(--chocolate-dark); background: rgb(${layer.colorClipping ? layer.colorClipping.color.r : 0}, ${layer.colorClipping ? layer.colorClipping.color.g : 255}, ${layer.colorClipping ? layer.colorClipping.color.b : 0});"></div>
                        <button onclick="activateColorClippingEyedropper()" style="padding: 10px 14px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; flex: 1;">
                            🎨 スポイト
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    許容値: <span id="colorClippingToleranceValue">${layer.colorClipping ? layer.colorClipping.tolerance : 30}</span>
                </label>
                <input type="range" class="property-slider" value="${layer.colorClipping ? layer.colorClipping.tolerance : 30}" 
                    min="0" max="255" step="1"
                    oninput="document.getElementById('colorClippingToleranceValue').textContent = this.value; setColorClippingTolerance(parseFloat(this.value))"
                    onchange="setColorClippingTolerance(parseFloat(this.value))">
            </div>
            
            <label class="checkbox-label" style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer;">
                <input type="checkbox" ${layer.colorClipping && layer.colorClipping.invertClipping ? 'checked' : ''} 
                    onchange="toggleColorClippingInvert(this.checked)">
                <span style="margin-left: 8px; font-size: 11px;">色を反転（選択色以外にクリッピング）</span>
            </label>
            
            <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                💡 参照レイヤーの指定色領域にクリッピング<br>
                ① 参照レイヤーを選択<br>
                ② スポイトで色を選択（省略時は全体にクリッピング）<br>
                ③ 選択した色の範囲だけにクリッピング適用
            </div>
        </div>
        
        ${generateWindSwayUI(layer)}
    `;
    
    // ツールボタンのスタイルを更新
    updateToolButtons();
    
    // 風揺れイベントリスナーを設定
    setupWindSwayEventListeners();
    
    // 色抜きクリッピングの参照レイヤーセレクトを更新
    if (typeof updateColorClippingReferenceSelect === 'function') {
        updateColorClippingReferenceSelect(layer);
    }
    
    // 風揺れピン表示を更新
    if (pinMode) {
        updatePinElements();
    } else {
        clearPinElements();
    }
    }
    
    // 口パクレイヤーの場合
    if (layer.type === 'lipsync') {
        propertiesPanel.innerHTML = `
            <h3>💬 ${layer.name}</h3>
            
            <div class="property-group">
                <h4>📍 トランスフォーム</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformXValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'x\', parseFloat(this.value))"
                            onchange="updateLayerProperty('x', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                            onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformYValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'y\', parseFloat(this.value))"
                            onchange="updateLayerProperty('y', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                            onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                            min="-360" max="360" step="0.1"
                            oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                            min="0.1" max="3" step="0.01"
                            oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                            onchange="updateLayerProperty('scale', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                            onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>💬 口パク制御</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        連番画像: ${layer.sequenceImages ? layer.sequenceImages.length : 0}枚
                    </label>
                    <button onclick="reloadLipSyncSequence(${layer.id})" style="width: 100%; padding: 8px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer;">📁 連番再読み込み</button>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        FPS: <span id="lipSyncFpsValue">${layer.fps || 12}</span>
                    </label>
                    <input type="range" class="property-slider" value="${layer.fps || 12}" 
                        min="1" max="60" step="1"
                        oninput="document.getElementById('lipSyncFpsValue').textContent = this.value; updateLayerProperty('fps', parseInt(this.value))">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <h5 style="margin: 8px 0;">キーフレーム</h5>
                    <div id="lipsync-keyframe-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 8px;">
                        ${(layer.keyframes || []).sort((a, b) => a.frame - b.frame).map((kf, i) => `
                            <div style="display: flex; gap: 8px; align-items: center; padding: 4px; background: rgba(255, 105, 180, 0.2); border-radius: 4px; margin-bottom: 4px;">
                                <span style="flex: 1; font-size: 11px;">${kf.type === 'start' ? '🎬 喋り出し' : '🛑 喋り終わり'}: ${kf.frame}f</span>
                                <button onclick="removeLipSyncKeyframe(${layer.id}, ${i})" style="padding: 2px 6px; background: var(--chocolate-dark); color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">削除</button>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="addLipSyncKeyframe(${layer.id}, 'start')" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #ff69b4, #ff1493); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">🎬 喋り出し</button>
                        <button onclick="addLipSyncKeyframe(${layer.id}, 'end')" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #ff1493, #c71585); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">🛑 喋り終わり</button>
                    </div>
                </div>
                
                <div style="background: rgba(255, 105, 180, 0.2); padding: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 喋り出し～喋り終わりの間は連番アニメーションがループ再生されます<br>
                    📌 最初のフレームは閉じた口にしてください
                </div>
            </div>
            
            <div class="property-group">
                <h4>⚙️ アンカーポイント</h4>
                <p style="font-size: 11px; color: var(--biscuit-light); margin-bottom: 8px;">
                    回転・スケールの中心点（赤い十字）
                </p>
                
                <div style="margin-bottom: 8px;">
                    <label>X: ${(layer.anchorX * 100).toFixed(0)}%</label>
                    <input type="range" class="property-slider" value="${layer.anchorX}" 
                        min="0" max="1" step="0.01"
                        oninput="setAnchorPointLive('x', parseFloat(this.value)); document.querySelector('#properties-panel label').textContent = 'X: ' + (parseFloat(this.value) * 100).toFixed(0) + '%'"
                        onchange="setAnchorPoint('x', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label>Y: ${(layer.anchorY * 100).toFixed(0)}%</label>
                    <input type="range" class="property-slider" value="${layer.anchorY}" 
                        min="0" max="1" step="0.01"
                        oninput="setAnchorPointLive('y', parseFloat(this.value)); document.querySelectorAll('#properties-panel label')[1].textContent = 'Y: ' + (parseFloat(this.value) * 100).toFixed(0) + '%'"
                        onchange="setAnchorPoint('y', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            ${generatePuppetFollowUI(layer)}
            
            <div class="property-group">
                <h4>👪 親レイヤー</h4>
                <label>親レイヤー: 
                    <select id="prop-parent" onchange="updateLayerProperty('parentLayerId', this.value ? parseInt(this.value) : null)">
                        <option value="">なし</option>
                        ${layers.filter(l => l.id !== layer.id).map(l => 
                            `<option value="${l.id}" ${l.id === layer.parentLayerId ? 'selected' : ''}>${l.name}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
        `;
        
        clearPinElements();
        return;
    }
    
    // まばたきレイヤーの場合
    if (layer.type === 'blink') {
        propertiesPanel.innerHTML = `
            <h3>👀 ${layer.name}</h3>
            
            <div class="property-group">
                <h4>📍 トランスフォーム</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformXValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'x\', parseFloat(this.value))"
                            onchange="updateLayerProperty('x', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                            onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformYValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'y\', parseFloat(this.value))"
                            onchange="updateLayerProperty('y', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                            onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                            min="-360" max="360" step="0.1"
                            oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                            min="0.1" max="3" step="0.01"
                            oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                            onchange="updateLayerProperty('scale', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                            onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>👀 まばたき制御</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        連番画像: ${layer.sequenceImages ? layer.sequenceImages.length : 0}枚
                    </label>
                    <button onclick="reloadBlinkSequence(${layer.id})" style="width: 100%; padding: 8px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer;">📁 連番再読み込み</button>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        FPS: <span id="blinkFpsValue">${layer.fps || 12}</span>
                    </label>
                    <input type="range" class="property-slider" value="${layer.fps || 12}" 
                        min="1" max="60" step="1"
                        oninput="document.getElementById('blinkFpsValue').textContent = this.value; updateLayerProperty('fps', parseInt(this.value))">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <h5 style="margin: 8px 0;">キーフレーム</h5>
                    <div id="blink-keyframe-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 8px;">
                        ${(layer.keyframes || []).sort((a, b) => a.frame - b.frame).map((kf, i) => `
                            <div style="display: flex; gap: 8px; align-items: center; padding: 4px; background: rgba(135, 206, 235, 0.2); border-radius: 4px; margin-bottom: 4px;">
                                <span style="flex: 1; font-size: 11px;">👀 まばたき: ${kf.frame}f</span>
                                <button onclick="removeBlinkKeyframe(${layer.id}, ${i})" style="padding: 2px 6px; background: var(--chocolate-dark); color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">削除</button>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="addBlinkKeyframe(${layer.id})" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #87ceeb, #4682b4); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">👀 まばたき挿入</button>
                </div>
                
                <div style="background: rgba(135, 206, 235, 0.2); padding: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 キーフレーム地点で連番アニメーションが一度再生されます<br>
                    📌 最初のフレームは開いた目にしてください
                </div>
            </div>
            
            <div class="property-group">
                <h4>⚙️ アンカーポイント</h4>
                <p style="font-size: 11px; color: var(--biscuit-light); margin-bottom: 8px;">
                    回転・スケールの中心点（赤い十字）
                </p>
                
                <div style="margin-bottom: 8px;">
                    <label>X: ${(layer.anchorX * 100).toFixed(0)}%</label>
                    <input type="range" class="property-slider" value="${layer.anchorX}" 
                        min="0" max="1" step="0.01"
                        oninput="setAnchorPointLive('x', parseFloat(this.value)); document.querySelector('#properties-panel label').textContent = 'X: ' + (parseFloat(this.value) * 100).toFixed(0) + '%'"
                        onchange="setAnchorPoint('x', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
                
                <div style="margin-bottom: 8px;">
                    <label>Y: ${(layer.anchorY * 100).toFixed(0)}%</label>
                    <input type="range" class="property-slider" value="${layer.anchorY}" 
                        min="0" max="1" step="0.01"
                        oninput="setAnchorPointLive('y', parseFloat(this.value)); document.querySelectorAll('#properties-panel label')[1].textContent = 'Y: ' + (parseFloat(this.value) * 100).toFixed(0) + '%'"
                        onchange="setAnchorPoint('y', parseFloat(this.value)); updatePropertiesPanel()">
                </div>
            </div>
            
            ${generatePuppetFollowUI(layer)}
            
            <div class="property-group">
                <h4>👪 親レイヤー</h4>
                <label>親レイヤー: 
                    <select id="prop-parent" onchange="updateLayerProperty('parentLayerId', this.value ? parseInt(this.value) : null)">
                        <option value="">なし</option>
                        ${layers.filter(l => l.id !== layer.id).map(l => 
                            `<option value="${l.id}" ${l.id === layer.parentLayerId ? 'selected' : ''}>${l.name}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
        `;
        
        clearPinElements();
        return;
    }
    
    // 揺れモーションレイヤーの場合
    if (layer.type === 'bounce') {
        // bounceParamsの初期化チェック
        if (!layer.bounceParams) {
            layer.bounceParams = getDefaultBounceParams();
        }
        // pinsプロパティの初期化チェック
        if (!layer.bounceParams.pins) {
            layer.bounceParams.pins = [];
        }
        // divisionsパラメータの初期化チェック（既存レイヤー対応）
        if (!layer.bounceParams.divisions) {
            layer.bounceParams.divisions = 20;
        }
        // swayVerticalDirectionパラメータの初期化チェック（既存レイヤー対応）
        if (!layer.bounceParams.swayVerticalDirection) {
            layer.bounceParams.swayVerticalDirection = 'both';
        }
        
        const bp = layer.bounceParams;
        
        propertiesPanel.innerHTML = `
            <h3>🎈 ${layer.name}</h3>
            
            <div class="property-group">
                <h4>🛠️ 操作ツール</h4>
                <div style="display: flex; gap: 8px;">
                    <button id="tool-rotation" onclick="toggleTool('rotation')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        🔁 回転ハンドル
                    </button>
                    <button id="tool-position" onclick="toggleTool('position')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        👇 ポジション
                    </button>
                </div>
                <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 ツールを選択してキャンバスをドラッグ<br>
                    🔁 回転ハンドル: レイヤーを回転<br>
                    👇 ポジション: 位置を変更<br>
                    ⚠️ X軸クリックで別ツール解除
                </div>
            </div>
            
            <div class="property-group">
                <h4>📍 トランスフォーム</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformXValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'x\', parseFloat(this.value))"
                            onchange="updateLayerProperty('x', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                            onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById(\'transformYValue\').textContent = this.value; if(this.nextElementSibling) this.nextElementSibling.value = this.value; updateLayerPropertyLive(\'y\', parseFloat(this.value))"
                            onchange="updateLayerProperty('y', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                            onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                            min="-360" max="360" step="0.1"
                            oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                            min="0.1" max="3" step="0.01"
                            oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                            onchange="updateLayerProperty('scale', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                            onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>⚓ アンカーポイント（変形の軸）</h4>
                <p style="font-size: 11px; color: var(--biscuit-light); margin-bottom: 8px;">
                    ⭐ <strong>アンカーが変形の軸になります！</strong><br>
                    🎯 アンカーポイントに向かって画像が伸縮します<br>
                    💡 例：上に弾ませたいなら、アンカーを上に配置<br>
                    ✨ <strong>いつでも何度でも位置を変更できます</strong>
                </p>
                <div style="background: rgba(255, 215, 0, 0.15); padding: 8px; border-radius: 4px; margin-bottom: 8px; border-left: 3px solid var(--accent-gold);">
                    <div style="font-size: 11px; color: var(--biscuit-light);">
                        📍 現在のアンカー位置: <strong style="color: var(--accent-gold);">X ${(layer.anchorX * 100).toFixed(0)}%, Y ${(layer.anchorY * 100).toFixed(0)}%</strong>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <button onclick="setAnchorPointClick()" id="tool-anchor" style="flex: 1; padding: 10px; background: linear-gradient(135deg, var(--accent-gold), #ff8c00); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3); transition: all 0.3s;">
                        🎯 クリックで位置変更
                    </button>
                    <button onclick="resetAnchorPoint()" style="flex: 1; padding: 10px; background: var(--chocolate-dark); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                        ↩️ 中央に戻す
                    </button>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px;">X: <span id="anchorXValue">${(layer.anchorX * 100).toFixed(0)}%</span></label>
                        <input type="range" class="property-slider" value="${(layer.anchorX * 100).toFixed(0)}" 
                            min="0" max="100" step="1"
                            oninput="document.getElementById('anchorXValue').textContent = this.value + '%'; setAnchorPointLive('x', parseFloat(this.value) / 100)"
                            onchange="setAnchorPoint('x', parseFloat(this.value) / 100)">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px;">Y: <span id="anchorYValue">${(layer.anchorY * 100).toFixed(0)}%</span></label>
                        <input type="range" class="property-slider" value="${(layer.anchorY * 100).toFixed(0)}" 
                            min="0" max="100" step="1"
                            oninput="document.getElementById('anchorYValue').textContent = this.value + '%'; setAnchorPointLive('y', parseFloat(this.value) / 100)"
                            onchange="setAnchorPoint('y', parseFloat(this.value) / 100)">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>🎈 揺れモーション制御</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">アニメーションタイプ</label>
                    <select id="bounce-type-select" style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;" onchange="updateBounceType(this.value)">
                        <option value="bounce" ${bp.type === 'bounce' ? 'selected' : ''}>弾み（Y軸伸縮）</option>
                        <option value="sway" ${bp.type === 'sway' ? 'selected' : ''}>揺れ（横揺れのみ）</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        メッシュ分割数: <span id="bounceDivisionsValue">${bp.divisions || 20}</span>
                    </label>
                    <input type="range" class="property-slider" id="bounce-divisions" value="${bp.divisions || 20}" 
                        min="1" max="50" step="1"
                        oninput="document.getElementById('bounceDivisionsValue').textContent = this.value; updateBounceParam('divisions', parseInt(this.value))">
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 大きな画像は数値を上げるとなめらかに</small>
                </div>
                
                <div id="bounce-amplitude-control" style="margin-bottom: 12px; display: ${bp.type === 'bounce' ? 'block' : 'none'};">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        伸縮の大きさ: <span id="bounceAmplitudeValue">${bp.amplitude}</span>px
                    </label>
                    <input type="range" class="property-slider" id="bounce-amplitude" value="${bp.amplitude}" 
                        min="0" max="200" step="1"
                        oninput="document.getElementById('bounceAmplitudeValue').textContent = this.value + 'px'; updateBounceParam('amplitude', parseInt(this.value))">
                </div>
                
                <div id="bounce-direction-control" style="margin-bottom: 12px; display: ${bp.type === 'bounce' ? 'block' : 'none'};">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">弾み方向</label>
                    <select id="bounce-bounce-direction" style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;" onchange="updateBounceParam('bounceDirection', this.value)">
                        <option value="down" ${(bp.bounceDirection === 'down' || !bp.bounceDirection) ? 'selected' : ''}>アンカーより上が伸縮 ↓</option>
                        <option value="up" ${bp.bounceDirection === 'up' ? 'selected' : ''}>アンカーより下が伸縮 ↑</option>
                    </select>
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 胸は上に、髪は下に向かって設定すると自然</small>
                </div>
                
                <div id="sway-amplitude-control" style="margin-bottom: 12px; display: ${bp.type === 'sway' ? 'block' : 'none'};">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        左右揺れの大きさ: <span id="bounceSwayAmplitudeValue">${bp.swayAmplitude}</span>px
                    </label>
                    <input type="range" class="property-slider" id="bounce-sway-amplitude" value="${bp.swayAmplitude}" 
                        min="0" max="300" step="1"
                        oninput="document.getElementById('bounceSwayAmplitudeValue').textContent = this.value + 'px'; updateBounceParam('swayAmplitude', parseInt(this.value))">
                </div>
                
                <div id="sway-direction-control" style="margin-bottom: 12px; display: ${bp.type === 'sway' ? 'block' : 'none'};">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">揺れ方向</label>
                    <select id="bounce-sway-direction" style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;" onchange="updateBounceParam('swayDirection', this.value)">
                        <option value="left" ${bp.swayDirection === 'left' ? 'selected' : ''}>左から右へ ←</option>
                        <option value="right" ${(bp.swayDirection === 'right' || !bp.swayDirection) ? 'selected' : ''}>右から左へ →</option>
                    </select>
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 胸や髪の毛など左右非対称な揺れに便利</small>
                </div>
                
                <div id="sway-vertical-direction-control" style="margin-bottom: 12px; display: ${bp.type === 'sway' ? 'block' : 'none'};">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">揺れる部分</label>
                    <select id="bounce-sway-vertical-direction" style="width: 100%; padding: 6px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;" onchange="updateBounceParam('swayVerticalDirection', this.value)">
                        <option value="both" ${(bp.swayVerticalDirection === 'both' || !bp.swayVerticalDirection) ? 'selected' : ''}>アンカーより上下両方</option>
                        <option value="up" ${bp.swayVerticalDirection === 'up' ? 'selected' : ''}>アンカーより上のみ ↑</option>
                        <option value="down" ${bp.swayVerticalDirection === 'down' ? 'selected' : ''}>アンカーより下のみ ↓</option>
                    </select>
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 髪は上、胸は下など部分的に揺らせます</small>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        揺れる回数: <span id="bounceFrequencyValue">${bp.frequency}</span>回
                    </label>
                    <input type="range" class="property-slider" id="bounce-frequency" value="${bp.frequency}" 
                        min="1" max="10" step="1"
                        oninput="document.getElementById('bounceFrequencyValue').textContent = this.value + '回'; updateBounceParam('frequency', parseInt(this.value))">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        減衰時間（余韻）: <span id="bounceDampingValue">${bp.dampingTime.toFixed(2)}</span>秒
                    </label>
                    <input type="range" class="property-slider" id="bounce-damping" value="${bp.dampingTime}" 
                        min="0.1" max="5.0" step="0.1"
                        oninput="document.getElementById('bounceDampingValue').textContent = parseFloat(this.value).toFixed(2) + '秒'; updateBounceParam('dampingTime', parseFloat(this.value))">
                </div>
                
                <div style="margin-bottom: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                    <h5 style="margin: 8px 0;">キーフレーム（アニメーション開始点）</h5>
                    <button onclick="addBounceKeyframeFromCurrent()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #ffa500, #ff8c00); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🎬 現在位置に挿入</button>
                    <div id="bounce-keyframe-list" style="margin-top: 8px; max-height: 200px; overflow-y: auto;"></div>
                </div>
                
                <!-- 揺れタイプのみ：ピンコントロール -->
                <div id="sway-pin-control" style="margin-bottom: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: ${bp.type === 'sway' ? 'block' : 'none'};">
                    <h5 style="font-weight: bold; margin-bottom: 8px;">📍 揺れ制御ピン（複数配置可能）</h5>
                    <button id="addBouncePinBtn" onclick="toggleBouncePinMode()" style="width: 100%; padding: 12px; background: ${bouncePinMode ? 'linear-gradient(135deg, var(--accent-gold), var(--biscuit-medium))' : 'var(--accent-orange)'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: ${bouncePinMode ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'}; transition: all 0.3s;">
                        ${bouncePinMode ? '✅ ピン挿入モード有効' : '➕ ピン挿入モードをON'}
                    </button>
                    
                    <div id="bounce-pin-mode-controls" style="margin-top: 12px;">
                        <div style="margin-bottom: 12px;">
                            <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                                影響範囲: <span id="bouncePinRangeValue">20</span>%
                            </label>
                            <input type="range" class="property-slider" id="bounce-pin-range" value="20" min="1" max="50" step="1" oninput="updateBouncePinRange(parseInt(this.value))">
                            <small style="font-size: 10px; color: var(--biscuit-light);">ピンから何%の範囲を固定するか</small>
                        </div>
                        
                        <div id="bounce-pin-list" style="max-height: 200px; overflow-y: auto;"></div>
                    </div>
                </div>
                
                <div style="background: rgba(255, 165, 0, 0.2); padding: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 <strong>弾み</strong> = Y軸伸縮のみ<br>
                    🌊 <strong>揺れ</strong> = 横揺れのみ（減衰あり）<br>
                    📍 <strong>ピン</strong> = 揺れを固定・抑制する箇所を配置<br>
                    ⚓ <strong>アンカーポイントが変形の軸です！</strong><br>
                    🎯 弾みタイプはアンカーに向かって伸縮します<br>
                    🎬 キーフレームで複数回のアニメーション挿入可能<br>
                    ↔️ 左右の揺れ方向を選択できます
                </div>
            </div>
            
            ${generatePuppetFollowUI(layer)}
            
            <div class="property-group">
                <h4>👪 親レイヤー</h4>
                <label>親レイヤー: 
                    <select id="prop-parent" onchange="updateLayerProperty('parentLayerId', this.value ? parseInt(this.value) : null)">
                        <option value="">なし</option>
                        ${layers.filter(l => l.id !== layer.id).map(l => 
                            `<option value="${l.id}" ${l.id === layer.parentLayerId ? 'selected' : ''}>${l.name}</option>`
                        ).join('')}
                    </select>
                </label>
            </div>
        `;
        
        // キーフレームリストを更新
        updateBounceKeyframeList();
        
        // ピンリストを更新
        if (typeof updateBouncePinList === 'function') {
            updateBouncePinList();
        }
        
        // ツールボタンのスタイルを更新
        updateToolButtons();
        
        return;
    }
    
    // パペットレイヤーの場合
    if (layer.type === 'puppet') {
        // intermediatePins、fixedPins、puppetStrength、puppetSmoothness、meshDensityの初期化チェック
        if (!layer.intermediatePins) layer.intermediatePins = [];
        if (!layer.fixedPins) layer.fixedPins = [];
        if (!layer.puppetStrength) layer.puppetStrength = 1.0;
        if (!layer.puppetSmoothness) layer.puppetSmoothness = 1.3;
        if (!layer.meshDensity) layer.meshDensity = 65;
        
        propertiesPanel.innerHTML = `
            <h3>🎭 ${layer.name}</h3>
            
            <div class="property-group">
                <h4>🛠️ 操作ツール</h4>
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <button onclick="togglePuppetHandleMode()" id="puppet-handle-mode-btn" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #ff8c42, #ffa94d); color: white; border: 2px solid var(--border-color); border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: all 0.3s;">
                        🎯 ハンドル設定
                    </button>
                    <button onclick="toggleIntermediatePinMode()" id="puppet-intermediate-pin-mode-btn" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #5cb85c, #71c671); color: white; border: 2px solid var(--border-color); border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: all 0.3s;">
                        📍 中間ピン追加
                    </button>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                    <button onclick="toggleFixedPinMode()" id="puppet-fixed-pin-mode-btn" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; border: 2px solid var(--border-color); border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transition: all 0.3s;">
                        🔒 固定ピン追加
                    </button>
                </div>
                <p style="font-size: 11px; color: var(--biscuit-light); line-height: 1.4;">
                    💡 <strong>ハンドル設定</strong>: 最初にクリックで変形用ハンドルを配置<br>
                    📍 <strong>中間ピン</strong>: カーブを追加するピンを配置<br>
                    🔒 <strong>固定ピン</strong>: 変形しない固定点を配置（軸周辺の固定に）<br>
                    ✨ ハンドル・ピンをドラッグすると自動でキーフレーム登録
                </p>
            </div>
            
            <div class="property-group">
                <h4>⚓ アンカーポイント（軸アンカー）</h4>
                <div style="display: flex; gap: 8px;">
                    <button onclick="startAnchorPointPick()" style="flex: 1; padding: 8px; background: var(--accent-orange); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🎯 クリックで設定
                    </button>
                    <button onclick="resetAnchorPoint()" style="flex: 1; padding: 8px; background: var(--chocolate-dark); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ↩️ 中央に戻す
                    </button>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px;">X: <span id="anchorXValue">${(layer.anchorX * 100).toFixed(0)}%</span></label>
                        <input type="range" class="property-slider" value="${(layer.anchorX * 100).toFixed(0)}" 
                            min="0" max="100" step="1"
                            oninput="document.getElementById('anchorXValue').textContent = this.value + '%'; setAnchorPointLive('x', parseFloat(this.value) / 100)"
                            onchange="setAnchorPoint('x', parseFloat(this.value) / 100)">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px;">Y: <span id="anchorYValue">${(layer.anchorY * 100).toFixed(0)}%</span></label>
                        <input type="range" class="property-slider" value="${(layer.anchorY * 100).toFixed(0)}" 
                            min="0" max="100" step="1"
                            oninput="document.getElementById('anchorYValue').textContent = this.value + '%'; setAnchorPointLive('y', parseFloat(this.value) / 100)"
                            onchange="setAnchorPoint('y', parseFloat(this.value) / 100)">
                    </div>
                </div>
                <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 パペット変形の軸となる点です（赤い十字で表示）<br>
                    🎯 クリック設定: キャンバスをクリックして関節位置に設定
                </div>
            </div>
            
            <div class="property-group">
                <h4>📍 トランスフォーム</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        X: <span id="transformXValue">${layer.x.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.x}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById('transformXValue').textContent = this.value; updateLayerPropertyLive('x', parseFloat(this.value))"
                            onchange="updateLayerProperty('x', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.x.toFixed(0)}" 
                            onchange="updateLayerProperty('x', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        Y: <span id="transformYValue">${layer.y.toFixed(0)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.y}" 
                            min="-2000" max="2000" step="1"
                            oninput="document.getElementById('transformYValue').textContent = this.value; updateLayerPropertyLive('y', parseFloat(this.value))"
                            onchange="updateLayerProperty('y', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.y.toFixed(0)}" 
                            onchange="updateLayerProperty('y', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        回転: <span id="transformRotValue">${layer.rotation.toFixed(1)}°</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.rotation}" 
                            min="-360" max="360" step="0.1"
                            oninput="document.getElementById('transformRotValue').textContent = parseFloat(this.value).toFixed(1) + '°'; updateLayerPropertyLive('rotation', parseFloat(this.value))"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.rotation.toFixed(1)}" step="0.1"
                            onchange="updateLayerProperty('rotation', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        スケール: <span id="transformScaleValue">${layer.scale.toFixed(2)}</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.scale}" 
                            min="0.1" max="3" step="0.01"
                            oninput="document.getElementById('transformScaleValue').textContent = parseFloat(this.value).toFixed(2); updateLayerPropertyLive('scale', parseFloat(this.value))"
                            onchange="updateLayerProperty('scale', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${layer.scale.toFixed(2)}" step="0.01"
                            onchange="updateLayerProperty('scale', parseFloat(this.value)); updatePropertiesPanel()">
                    </div>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        不透明度: <span id="transformOpacityValue">${(layer.opacity * 100).toFixed(0)}%</span>
                    </label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" class="property-slider" style="flex: 1;" value="${layer.opacity}" 
                            min="0" max="1" step="0.01"
                            oninput="document.getElementById('transformOpacityValue').textContent = Math.round(parseFloat(this.value) * 100) + '%'; updateLayerPropertyLive('opacity', parseFloat(this.value))"
                            onchange="updateLayerProperty('opacity', parseFloat(this.value))">
                        <input type="number" style="width: 80px;" value="${(layer.opacity * 100).toFixed(0)}" 
                            onchange="updateLayerProperty('opacity', parseFloat(this.value) / 100); updatePropertiesPanel()">
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h4>🛠️ 操作ツール</h4>
                <div style="display: flex; gap: 8px;">
                    <button id="tool-rotation" onclick="toggleTool('rotation')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        🔁 回転ハンドル
                    </button>
                    <button id="tool-position" onclick="toggleTool('position')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, var(--biscuit-dark), var(--biscuit-medium)); color: var(--chocolate-dark); border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                        👇 ポジション
                    </button>
                </div>
                <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 ツールを選択してキャンバスをドラッグ<br>
                    🔁 回転: アンカーを中心に回転<br>
                    👇 ポジション: 画像を移動
                </div>
            </div>
            
            <div class="property-group">
                <h4>🎭 パペット設定</h4>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        変形強度: <span id="puppetStrengthValue">${layer.puppetStrength.toFixed(2)}</span>
                    </label>
                    <input type="range" class="property-slider" value="${layer.puppetStrength}" 
                        min="0" max="3" step="0.1"
                        oninput="document.getElementById('puppetStrengthValue').textContent = parseFloat(this.value).toFixed(2); updatePuppetStrength(parseFloat(this.value))">
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 湾曲の強さ</small>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        滑らかさ: <span id="puppetSmoothnessValue">${layer.puppetSmoothness.toFixed(2)}</span>
                    </label>
                    <input type="range" class="property-slider" value="${layer.puppetSmoothness}" 
                        min="0.3" max="3" step="0.1"
                        oninput="document.getElementById('puppetSmoothnessValue').textContent = parseFloat(this.value).toFixed(2); updatePuppetSmoothness(parseFloat(this.value))">
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 変形の影響範囲（大きいほど滑らか）</small>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        メッシュ密度: <span id="meshDensityValue">${layer.meshDensity}</span>
                    </label>
                    <input type="range" class="property-slider" value="${layer.meshDensity}" 
                        min="10" max="80" step="5"
                        oninput="document.getElementById('meshDensityValue').textContent = this.value; updateMeshDensity(parseInt(this.value))">
                    <small style="font-size: 10px; color: var(--biscuit-light); display: block; margin-top: 4px;">💡 高いほど滑らか（処理は重くなる）</small>
                </div>
                
                <div style="background: rgba(147, 112, 219, 0.15); padding: 8px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #9370db;">
                    <div style="font-size: 11px; color: var(--biscuit-light);">
                        📍 中間ピン数: <strong style="color: #9370db;">${layer.intermediatePins.length}</strong> | 
                        🔒 固定ピン数: <strong style="color: #6c5ce7;">${layer.fixedPins ? layer.fixedPins.length : 0}</strong>
                    </div>
                </div>
            </div>
            
            <div class="property-group" id="intermediate-pins-list">
                <h4>📍 中間ピン一覧</h4>
                <div id="intermediate-pins-container"></div>
            </div>
            
            <div class="property-group" id="fixed-pins-list">
                <h4>🔒 固定ピン一覧</h4>
                <div id="fixed-pins-container"></div>
            </div>
            
            <div class="property-group">
                <h4>🎨 表示設定</h4>
                <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                    ブレンドモード:
                    <select onchange="updateLayerProperty('blendMode', this.value)" style="width: 100%; padding: 6px; margin-top: 4px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>通常</option>
                        <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>乗算</option>
                        <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>スクリーン</option>
                        <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>オーバーレイ</option>
                        <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>比較(暗)</option>
                        <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>比較(明)</option>
                    </select>
                </label>
            </div>
            
            <div class="property-group">
                <h4>🔗 親子関係</h4>
                <label style="font-size: 11px;">
                    親レイヤー:
                    <select onchange="updateLayerProperty('parentLayerId', this.value === 'none' ? null : parseInt(this.value))" style="width: 100%; padding: 6px; margin-top: 4px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="none" ${!layer.parentLayerId ? 'selected' : ''}>なし</option>
                        ${layers
                            .filter(l => l.id !== layer.id && l.type !== 'folder')
                            .map(l => 
                                `<option value="${l.id}" ${l.id === layer.parentLayerId ? 'selected' : ''}>${l.name}</option>`
                            ).join('')}
                    </select>
                </label>
            </div>
        `;
        
        // 中間ピンリストを更新
        updateIntermediatePinsList();
        
        // 固定ピンリストを更新
        updateFixedPinsList();
        
        // ツールボタンのスタイルを更新
        if (typeof updatePuppetModeUI === 'function') {
            updatePuppetModeUI();
        }
        
        // アンカー要素を描画
        if (typeof drawPuppetAnchorElements === 'function') {
            drawPuppetAnchorElements();
        }
        
        // ツールボタン状態を更新
        updateToolButtons();
        
        return;
    }
}

// ===== 風揺れUI生成 =====
function generateWindSwayUI(layer) {
    const ws = layer.windSwayParams;
    const presets = getWindSwayPresets();
    
    return `
        <div class="property-group">
            <h4>💨 風揺れエフェクト</h4>
            
            <div style="margin-bottom: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(210, 180, 140, 0.2); border-radius: 4px; cursor: pointer;">
                    <input type="checkbox" id="prop-windsway" ${layer.windSwayEnabled ? 'checked' : ''}>
                    <span style="font-weight: bold;">風揺れを有効化</span>
                </label>
            </div>
            
            <div id="windsway-controls" style="display: ${layer.windSwayEnabled ? 'block' : 'none'}">
                
                <!-- プリセット -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">🎨 プリセット:</label>
                    <select id="prop-wind-preset" style="width: 100%; padding: 6px; background: var(--chocolate-light); color: var(--biscuit-light); border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="custom">カスタム</option>
                        ${Object.entries(presets).map(([key, preset]) => 
                            `<option value="${key}">${preset.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <!-- 分割数 -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        分割数: <span id="windDivisionsValue">${ws.divisions}</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-divisions" value="${ws.divisions}" 
                        min="1" max="50" step="1">
                </div>
                
                <!-- 揺れ角度 -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        揺れ角度: <span id="windAngleValue">${ws.angle}°</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-angle" value="${ws.angle}" 
                        min="0" max="360" step="1">
                </div>
                
                <!-- 揺れ周期 -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        揺れ周期: <span id="windPeriodValue">${ws.period.toFixed(1)}秒</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-period" value="${ws.period}" 
                        min="0.1" max="10" step="0.1">
                </div>
                
                <!-- 揺れズレ -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        揺れズレ: <span id="windPhaseShiftValue">${ws.phaseShift}°</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-phaseshift" value="${ws.phaseShift}" 
                        min="-360" max="360" step="1">
                </div>
                
                <!-- センター -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        センター: <span id="windCenterValue">${ws.center}°</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-center" value="${ws.center}" 
                        min="-180" max="180" step="1">
                </div>
                
                <!-- 上固定 -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        上固定: <span id="windTopFixedValue">${ws.topFixed}%</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-topfixed" value="${ws.topFixed}" 
                        min="0" max="100" step="1">
                </div>
                
                <!-- 下固定 -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        下固定: <span id="windBottomFixedValue">${ws.bottomFixed}%</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-bottomfixed" value="${ws.bottomFixed}" 
                        min="0" max="100" step="1">
                </div>
                
                <!-- 下から揺れる -->
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="prop-wind-frombottom" ${ws.fromBottom ? 'checked' : ''}>
                        <span>下から揺れる</span>
                    </label>
                </div>
                
                <!-- ランダム揺れ -->
                <div style="margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="prop-wind-randomswing" ${ws.randomSwing ? 'checked' : ''}>
                        <span>ランダム揺れ</span>
                    </label>
                </div>
                
                <!-- ランダムパターン -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        ランダムパターン: <span id="windRandomPatternValue">${ws.randomPattern}</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-randompattern" value="${ws.randomPattern}" 
                        min="0" max="50" step="1">
                </div>
                
                <!-- シード値 -->
                <div style="margin-bottom: 0;">
                    <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                        シード値: <span id="windSeedValue">${ws.seed}</span>
                    </label>
                    <input type="range" class="property-slider" id="prop-wind-seed" value="${ws.seed}" 
                        min="1" max="99999" step="1">
                </div>
                
                <!-- ピンモード（常時有効・ボタンで挿入モード切り替え） -->
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);"></div>
                
                <div style="margin-bottom: 12px;">
                    <h5 style="font-weight: bold; margin-bottom: 8px;">📍 軸ピン（複数配置可能）</h5>
                    <button id="addPinBtn" onclick="togglePinMode()" style="width: 100%; padding: 12px; background: ${pinMode ? 'linear-gradient(135deg, var(--accent-gold), var(--biscuit-medium))' : 'var(--accent-orange)'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: ${pinMode ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'}; transition: all 0.3s;">
                        ${pinMode ? '✅ ピン挿入モード有効' : '➕ ピン挿入モードをON'}
                    </button>
                </div>
                
                <div id="pin-mode-controls">
                    <div style="margin-bottom: 12px;">
                        <label style="font-size: 11px; display: block; margin-bottom: 4px;">
                            影響範囲: <span id="pinRangeValue">20</span>%
                        </label>
                        <input type="range" class="property-slider" id="prop-pin-range" value="20" min="1" max="50" step="1">
                        <small style="font-size: 10px; color: var(--biscuit-light);">ピンから何%の範囲を固定するか</small>
                    </div>
                    
                    <div id="pin-list" style="max-height: 200px; overflow-y: auto;"></div>
                </div>
                
                
                <div style="background: rgba(210, 105, 30, 0.2); padding: 8px; margin-top: 12px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: var(--biscuit-light);">
                    💡 WindSway-Editorから完全移植<br>
                    🎨 プリセットで様々な揺れを試せます<br>
                    💨 フォルダーに適用すると子レイヤーを一括で風揺れ<br>
                    🔄 レイヤー単体・フォルダー両方で重ね掛け可能
                </div>
            </div>
        </div>
    `;
}

// ===== 風揺れイベントリスナー設定 =====
function setupWindSwayEventListeners() {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    // 有効化チェックボックス
    const enableCheckbox = document.getElementById('prop-windsway');
    if (enableCheckbox) {
        enableCheckbox.addEventListener('change', (e) => {
            layer.windSwayEnabled = e.target.checked;
            const controls = document.getElementById('windsway-controls');
            if (controls) {
                controls.style.display = e.target.checked ? 'block' : 'none';
            }
            updateLayerList();
            render();
        });
    }
    
    // プリセット選択
    const presetSelect = document.getElementById('prop-wind-preset');
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') return;
            
            const presets = getWindSwayPresets();
            const preset = presets[e.target.value];
            if (preset) {
                // プリセット値を適用
                Object.keys(preset).forEach(key => {
                    if (key !== 'name') {
                        layer.windSwayParams[key] = preset[key];
                    }
                });
                
                // UIを更新
                updatePropertiesPanel();
                render();
            }
        });
    }
    
    // 各パラメータスライダー
    setupWindSwaySlider('divisions', 'windDivisionsValue', (value) => {
        layer.windSwayParams.divisions = parseInt(value);
        render();
    });
    
    setupWindSwaySlider('angle', 'windAngleValue', (value) => {
        layer.windSwayParams.angle = parseFloat(value);
        render();
    }, '°');
    
    setupWindSwaySlider('period', 'windPeriodValue', (value) => {
        layer.windSwayParams.period = parseFloat(value);
        render();
    }, '秒', 1);
    
    setupWindSwaySlider('phaseshift', 'windPhaseShiftValue', (value) => {
        layer.windSwayParams.phaseShift = parseFloat(value);
        render();
    }, '°');
    
    setupWindSwaySlider('center', 'windCenterValue', (value) => {
        layer.windSwayParams.center = parseFloat(value);
        render();
    }, '°');
    
    setupWindSwaySlider('topfixed', 'windTopFixedValue', (value) => {
        layer.windSwayParams.topFixed = parseFloat(value);
        render();
    }, '%');
    
    setupWindSwaySlider('bottomfixed', 'windBottomFixedValue', (value) => {
        layer.windSwayParams.bottomFixed = parseFloat(value);
        render();
    }, '%');
    
    setupWindSwaySlider('randompattern', 'windRandomPatternValue', (value) => {
        layer.windSwayParams.randomPattern = parseInt(value);
        render();
    });
    
    setupWindSwaySlider('seed', 'windSeedValue', (value) => {
        layer.windSwayParams.seed = parseInt(value);
        render();
    });
    
    // チェックボックス
    const fromBottomCheck = document.getElementById('prop-wind-frombottom');
    if (fromBottomCheck) {
        fromBottomCheck.addEventListener('change', (e) => {
            layer.windSwayParams.fromBottom = e.target.checked;
            render();
        });
    }
    
    const randomSwingCheck = document.getElementById('prop-wind-randomswing');
    if (randomSwingCheck) {
        randomSwingCheck.addEventListener('change', (e) => {
            layer.windSwayParams.randomSwing = e.target.checked;
            render();
        });
    }
    
    setupPinModeListeners();
}

// ===== 風揺れスライダーのセットアップ =====
function setupWindSwaySlider(paramName, valueSpanId, onChange, suffix = '', decimals = 0) {
    const slider = document.getElementById(`prop-wind-${paramName}`);
    const valueSpan = document.getElementById(valueSpanId);
    
    if (slider && valueSpan) {
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const displayValue = decimals > 0 ? value.toFixed(decimals) : value;
            valueSpan.textContent = displayValue + suffix;
            onChange(value);
        });
    }
}

// ===== レイヤープロパティ更新 =====
function updateLayerProperty(prop, value) {
    if (selectedLayerIds.length !== 1) return;
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    // 親レイヤー変更時は座標を調整して画面上の位置を維持
    if (prop === 'parentLayerId') {
        const oldParentId = layer.parentLayerId;
        const newParentId = value;
        
        // 親が変更される場合のみ座標調整
        if (oldParentId !== newParentId) {
            // 現在の絶対座標を保存
            const currentWorldX = layer.x;
            const currentWorldY = layer.y;
            const currentRotation = layer.rotation;
            const currentScale = layer.scale;
            
            // 新しい親が設定される場合
            if (newParentId !== null) {
                const newParent = layers.find(l => l.id === newParentId);
                if (newParent) {
                    // 親の変形を逆適用して相対座標を計算
                    // 画像レイヤーの場合のみ（フォルダは変形を持たない）
                    if (newParent.type === 'image') {
                        // 親のアンカーポイントオフセット
                        const parentAnchorOffsetX = newParent.anchorX * newParent.width;
                        const parentAnchorOffsetY = newParent.anchorY * newParent.height;
                        
                        // 親の中心からの相対位置
                        let relX = currentWorldX - newParent.x;
                        let relY = currentWorldY - newParent.y;
                        
                        // 親の回転を逆適用
                        const parentRad = -newParent.rotation * Math.PI / 180;
                        const cos = Math.cos(parentRad);
                        const sin = Math.sin(parentRad);
                        
                        const rotatedX = relX * cos - relY * sin;
                        const rotatedY = relX * sin + relY * cos;
                        
                        // 親のスケールを逆適用
                        relX = rotatedX / newParent.scale;
                        relY = rotatedY / newParent.scale;
                        
                        // 親のアンカーオフセットを考慮
                        relX += parentAnchorOffsetX - newParent.width / 2;
                        relY += parentAnchorOffsetY - newParent.height / 2;
                        
                        // 相対座標を設定
                        layer.x = relX;
                        layer.y = relY;
                        layer.rotation = currentRotation - newParent.rotation;
                        layer.scale = currentScale / newParent.scale;
                    } else {
                        // フォルダの場合は単純な相対座標
                        layer.x = currentWorldX - newParent.x;
                        layer.y = currentWorldY - newParent.y;
                    }
                }
            }
            // 親が解除される場合
            else if (oldParentId !== null) {
                const oldParent = layers.find(l => l.id === oldParentId);
                if (oldParent && oldParent.type === 'image') {
                    // 親の変形を適用して絶対座標に戻す
                    const parentAnchorOffsetX = oldParent.anchorX * oldParent.width;
                    const parentAnchorOffsetY = oldParent.anchorY * oldParent.height;
                    
                    // 相対座標を絶対座標に変換
                    let absX = layer.x - (parentAnchorOffsetX - oldParent.width / 2);
                    let absY = layer.y - (parentAnchorOffsetY - oldParent.height / 2);
                    
                    // 親のスケールを適用
                    absX *= oldParent.scale;
                    absY *= oldParent.scale;
                    
                    // 親の回転を適用
                    const parentRad = oldParent.rotation * Math.PI / 180;
                    const cos = Math.cos(parentRad);
                    const sin = Math.sin(parentRad);
                    
                    const rotatedX = absX * cos - absY * sin;
                    const rotatedY = absX * sin + absY * cos;
                    
                    // 親の位置を加算
                    layer.x = rotatedX + oldParent.x;
                    layer.y = rotatedY + oldParent.y;
                    layer.rotation += oldParent.rotation;
                    layer.scale *= oldParent.scale;
                } else if (oldParent) {
                    // フォルダの場合
                    layer.x = currentWorldX;
                    layer.y = currentWorldY;
                }
            }
        }
        
        layer.parentLayerId = value;
    } else {
        layer[prop] = value;
    }
    
    // トランスフォームプロパティ変更時はキーフレーム自動挿入
    if (['x', 'y', 'rotation', 'scale', 'opacity'].includes(prop)) {
        if (typeof autoInsertKeyframe === 'function') {
            const properties = {};
            properties[prop] = value;
            autoInsertKeyframe(layer.id, properties);
        }
    }
    
    render();
}

// ===== レイヤープロパティ更新（リアルタイムプレビュー用） =====
function updateLayerPropertyLive(prop, value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    layer[prop] = value;
    render();
}

// ===== アンカーポイント設定開始 =====
function startAnchorPointPick() {
    anchorPointPickMode = true;
    canvas.style.cursor = 'crosshair';
    
    // 既存のイベントリスナーを削除
    if (anchorPointClickHandler) {
        canvas.removeEventListener('click', anchorPointClickHandler);
    }
    
    // 新しいイベントリスナーを設定
    anchorPointClickHandler = (e) => {
        const layer = layers.find(l => l.id === selectedLayerIds[0]);
        if (!layer) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        // 親の変形を考慮したワールド座標を計算
        let worldX = layer.x;
        let worldY = layer.y;
        let worldRotation = layer.rotation;
        let worldScale = layer.scale;
        
        // 親を遡ってワールド座標を計算
        let currentLayer = layer;
        while (currentLayer.parentLayerId) {
            const parent = layers.find(l => l.id === currentLayer.parentLayerId);
            if (!parent) break;
            
            // フォルダの場合（widthとheightがないので簡略化）
            if (parent.type === 'folder') {
                // 親のスケールを適用
                let relX = worldX * parent.scale;
                let relY = worldY * parent.scale;
                
                // 親の回転を適用
                const parentRad = parent.rotation * Math.PI / 180;
                const cos = Math.cos(parentRad);
                const sin = Math.sin(parentRad);
                
                const rotatedX = relX * cos - relY * sin;
                const rotatedY = relX * sin + relY * cos;
                
                // 親の位置を加算
                worldX = rotatedX + parent.x;
                worldY = rotatedY + parent.y;
                worldRotation += parent.rotation;
                worldScale *= parent.scale;
                
                currentLayer = parent;
                continue;
            }
            
            // 画像レイヤー（またはパペットレイヤー）の場合、親の変形を適用
            const parentWidth = parent.type === 'puppet' ? parent.img.width : parent.width;
            const parentHeight = parent.type === 'puppet' ? parent.img.height : parent.height;
            const parentAnchorOffsetX = parent.anchorX * parentWidth;
            const parentAnchorOffsetY = parent.anchorY * parentHeight;
            
            // 親のアンカーオフセットを引く
            let relX = worldX - (parentAnchorOffsetX - parentWidth / 2);
            let relY = worldY - (parentAnchorOffsetY - parentHeight / 2);
            
            // 親のスケールを適用
            relX *= parent.scale;
            relY *= parent.scale;
            
            // 親の回転を適用
            const parentRad = parent.rotation * Math.PI / 180;
            const cos = Math.cos(parentRad);
            const sin = Math.sin(parentRad);
            
            const rotatedX = relX * cos - relY * sin;
            const rotatedY = relX * sin + relY * cos;
            
            // 親の位置を加算
            worldX = rotatedX + parent.x;
            worldY = rotatedY + parent.y;
            worldRotation += parent.rotation;
            worldScale *= parent.scale;
            
            currentLayer = parent;
        }
        
        // ワールド座標でローカル座標に変換
        const rad = -worldRotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        const offsetX = (mouseX - worldX) / worldScale;
        const offsetY = (mouseY - worldY) / worldScale;
        
        const localX = offsetX * cos - offsetY * sin;
        const localY = offsetX * sin + offsetY * cos;
        
        // パペットレイヤーの場合は画像サイズを使用
        const layerWidth = layer.type === 'puppet' ? layer.img.width : layer.width;
        const layerHeight = layer.type === 'puppet' ? layer.img.height : layer.height;
        
        // 古いアンカーポイントを保存
        const oldAnchorX = layer.anchorX;
        const oldAnchorY = layer.anchorY;
        
        // 0-1の範囲に変換
        const newAnchorX = Math.max(0, Math.min(1, (localX + layerWidth / 2) / layerWidth));
        const newAnchorY = Math.max(0, Math.min(1, (localY + layerHeight / 2) / layerHeight));
        
        // アンカーポイントの変化量を計算
        const anchorDeltaX = (newAnchorX - oldAnchorX) * layerWidth;
        const anchorDeltaY = (newAnchorY - oldAnchorY) * layerHeight;
        
        // レイヤーの回転を考慮して位置を調整
        const layerRad = layer.rotation * Math.PI / 180;
        const layerCos = Math.cos(layerRad);
        const layerSin = Math.sin(layerRad);
        
        const worldDeltaX = (anchorDeltaX * layerCos - anchorDeltaY * layerSin) * layer.scale;
        const worldDeltaY = (anchorDeltaX * layerSin + anchorDeltaY * layerCos) * layer.scale;
        
        // アンカーポイントを更新
        layer.anchorX = newAnchorX;
        layer.anchorY = newAnchorY;
        
        // 位置を補正（見た目の位置が変わらないように）
        layer.x += worldDeltaX;
        layer.y += worldDeltaY;
        
        // モードを解除
        anchorPointPickMode = false;
        canvas.style.cursor = 'default';
        canvas.removeEventListener('click', anchorPointClickHandler);
        anchorPointClickHandler = null;
        
        updatePropertiesPanel();
        render();
    };
    
    canvas.addEventListener('click', anchorPointClickHandler);
}

// ===== アンカーポイントリセット =====
function resetAnchorPoint() {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    // パペットレイヤーの場合は画像サイズを使用
    const layerWidth = layer.type === 'puppet' ? layer.img.width : layer.width;
    const layerHeight = layer.type === 'puppet' ? layer.img.height : layer.height;
    
    // 古いアンカーポイントを保存
    const oldAnchorX = layer.anchorX;
    const oldAnchorY = layer.anchorY;
    
    // アンカーポイントを中央に
    const newAnchorX = 0.5;
    const newAnchorY = 0.5;
    
    // アンカーポイントの変化量を計算
    const anchorDeltaX = (newAnchorX - oldAnchorX) * layerWidth;
    const anchorDeltaY = (newAnchorY - oldAnchorY) * layerHeight;
    
    // レイヤーの回転を考慮して位置を調整
    const layerRad = layer.rotation * Math.PI / 180;
    const layerCos = Math.cos(layerRad);
    const layerSin = Math.sin(layerRad);
    
    const worldDeltaX = (anchorDeltaX * layerCos - anchorDeltaY * layerSin) * layer.scale;
    const worldDeltaY = (anchorDeltaX * layerSin + anchorDeltaY * layerCos) * layer.scale;
    
    // アンカーポイントを更新
    layer.anchorX = newAnchorX;
    layer.anchorY = newAnchorY;
    
    // 位置を補正（見た目の位置が変わらないように）
    layer.x += worldDeltaX;
    layer.y += worldDeltaY;
    
    updatePropertiesPanel();
    render();
}

// ===== アンカーポイント設定（スライダー用） =====
function setAnchorPoint(axis, value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    // パペットレイヤーの場合は画像サイズを使用
    const layerWidth = layer.type === 'puppet' ? layer.img.width : layer.width;
    const layerHeight = layer.type === 'puppet' ? layer.img.height : layer.height;
    
    // 古いアンカーポイントを保存
    const oldAnchorX = layer.anchorX;
    const oldAnchorY = layer.anchorY;
    
    if (axis === 'x') {
        layer.anchorX = value;
    } else if (axis === 'y') {
        layer.anchorY = value;
    }
    
    // アンカーポイントの変化量を計算
    const anchorDeltaX = (layer.anchorX - oldAnchorX) * layerWidth;
    const anchorDeltaY = (layer.anchorY - oldAnchorY) * layerHeight;
    
    // レイヤーの回転を考慮して位置を調整
    const layerRad = layer.rotation * Math.PI / 180;
    const layerCos = Math.cos(layerRad);
    const layerSin = Math.sin(layerRad);
    
    const worldDeltaX = (anchorDeltaX * layerCos - anchorDeltaY * layerSin) * layer.scale;
    const worldDeltaY = (anchorDeltaX * layerSin + anchorDeltaY * layerCos) * layer.scale;
    
    // 位置を補正（見た目の位置が変わらないように）
    layer.x += worldDeltaX;
    layer.y += worldDeltaY;
    
    render();
}

// ===== アンカーポイント設定（リアルタイムプレビュー用） =====
function setAnchorPointLive(axis, value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    // パペットレイヤーの場合は画像サイズを使用
    const layerWidth = layer.type === 'puppet' ? layer.img.width : layer.width;
    const layerHeight = layer.type === 'puppet' ? layer.img.height : layer.height;
    
    // 古いアンカーポイントを保存
    const oldAnchorX = layer.anchorX;
    const oldAnchorY = layer.anchorY;
    
    if (axis === 'x') {
        layer.anchorX = value;
    } else if (axis === 'y') {
        layer.anchorY = value;
    }
    
    // アンカーポイントの変化量を計算
    const anchorDeltaX = (layer.anchorX - oldAnchorX) * layerWidth;
    const anchorDeltaY = (layer.anchorY - oldAnchorY) * layerHeight;
    
    // レイヤーの回転を考慮して位置を調整
    const layerRad = layer.rotation * Math.PI / 180;
    const layerCos = Math.cos(layerRad);
    const layerSin = Math.sin(layerRad);
    
    const worldDeltaX = (anchorDeltaX * layerCos - anchorDeltaY * layerSin) * layer.scale;
    const worldDeltaY = (anchorDeltaX * layerSin + anchorDeltaY * layerCos) * layer.scale;
    
    // 位置を補正（見た目の位置が変わらないように）
    layer.x += worldDeltaX;
    layer.y += worldDeltaY;
    
    render();
}

// ===== ピンモードイベントリスナー =====
function setupPinModeListeners() {
    // ピンレンジスライダー
    const pinRangeSlider = document.getElementById('prop-pin-range');
    if (pinRangeSlider) {
        pinRangeSlider.addEventListener('input', (e) => {
            pinRange = parseFloat(e.target.value);
            document.getElementById('pinRangeValue').textContent = pinRange;
        });
    }
    
    updatePinList();
    
    // ピンモードが有効な場合は表示を更新
    if (pinMode) {
        updatePinElements();
    }
}

// ===== 口パクキーフレーム追加 =====
function addLipSyncKeyframe(layerId, type) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // 現在のフレーム番号を取得（projectFPSベース）
    const currentFrame = Math.floor(currentTime * (typeof projectFPS !== 'undefined' ? projectFPS : 30));
    
    // キーフレームを追加
    if (!layer.keyframes) layer.keyframes = [];
    layer.keyframes.push({ frame: currentFrame, type: type });
    
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

// ===== 口パクキーフレーム削除 =====
function removeLipSyncKeyframe(layerId, index) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.keyframes) return;
    
    layer.keyframes.splice(index, 1);
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

// ===== 口パク連番再読み込み =====
function reloadLipSyncSequence(layerId) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true; // フォルダ選択
    input.onchange = (e) => {
        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length < 2) {
            alert('口パクレイヤーには少なくとも2枚の画像が必要です');
            return;
        }
        
        loadSequenceImages(files, (images) => {
            layer.sequenceImages = images;
            updatePropertiesPanel();
            render();
        });
    };
    input.click();
}

// ===== まばたきキーフレーム追加 =====
function addBlinkKeyframe(layerId) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // 現在のフレーム番号を取得（projectFPSベース）
    const currentFrame = Math.floor(currentTime * (typeof projectFPS !== 'undefined' ? projectFPS : 30));
    
    // キーフレームを追加
    if (!layer.keyframes) layer.keyframes = [];
    layer.keyframes.push({ frame: currentFrame });
    
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

// ===== まばたきキーフレーム削除 =====
function removeBlinkKeyframe(layerId, index) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.keyframes) return;
    
    layer.keyframes.splice(index, 1);
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

// ===== まばたき連番再読み込み =====
function reloadBlinkSequence(layerId) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true; // フォルダ選択
    input.onchange = (e) => {
        const files = Array.from(e.target.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length < 2) {
            alert('まばたきレイヤーには少なくとも2枚の画像が必要です');
            return;
        }
        
        loadSequenceImages(files, (images) => {
            layer.sequenceImages = images;
            updatePropertiesPanel();
            render();
        });
    };
    input.click();
}

// ===== 揺れモーション用関数 =====
function updateBounceType(type) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'bounce') return;
    
    layer.bounceParams.type = type;
    
    // bounceタイプの場合のみ伸縮の大きさと弾み方向コントロールを表示
    const bounceAmplitudeControl = document.getElementById('bounce-amplitude-control');
    if (bounceAmplitudeControl) {
        bounceAmplitudeControl.style.display = type === 'bounce' ? 'block' : 'none';
    }
    
    const bounceDirectionControl = document.getElementById('bounce-direction-control');
    if (bounceDirectionControl) {
        bounceDirectionControl.style.display = type === 'bounce' ? 'block' : 'none';
    }
    
    // swayタイプの場合のみ左右揺れコントロールと方向選択を表示
    const swayControl = document.getElementById('sway-amplitude-control');
    if (swayControl) {
        swayControl.style.display = type === 'sway' ? 'block' : 'none';
    }
    
    const directionControl = document.getElementById('sway-direction-control');
    if (directionControl) {
        directionControl.style.display = type === 'sway' ? 'block' : 'none';
    }
    
    const verticalDirectionControl = document.getElementById('sway-vertical-direction-control');
    if (verticalDirectionControl) {
        verticalDirectionControl.style.display = type === 'sway' ? 'block' : 'none';
    }
    
    // swayタイプの場合のみピンコントロールを表示
    const pinControl = document.getElementById('sway-pin-control');
    if (pinControl) {
        pinControl.style.display = type === 'sway' ? 'block' : 'none';
    }
    
    // ピンモードをOFFにする
    if (type !== 'sway' && bouncePinMode) {
        bouncePinMode = false;
        clearBouncePinElements();
        canvas.style.cursor = 'default';
    }
    
    render();
}

function updateBounceParam(param, value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'bounce') return;
    
    layer.bounceParams[param] = value;
    render();
}

// ===== 揺れモーション軸設定モード =====
let bounceAnchorClickMode = false;

function setAnchorPointClick() {
    bounceAnchorClickMode = !bounceAnchorClickMode;
    console.log('[Bounce Anchor] クリックモード切り替え:', bounceAnchorClickMode);
    
    // アンカーモードを有効にする場合、他のモードを無効化
    if (bounceAnchorClickMode) {
        // ピンモードを無効化
        if (typeof bouncePinMode !== 'undefined' && bouncePinMode) {
            bouncePinMode = false;
            updateBouncePinModeUI();
        }
        // 風揺れピンモードを無効化
        if (typeof pinMode !== 'undefined' && pinMode) {
            pinMode = false;
            updatePinModeUI();
        }
    }
    
    const btn = document.getElementById('tool-anchor');
    if (btn) {
        if (bounceAnchorClickMode) {
            btn.style.background = 'linear-gradient(135deg, var(--accent-gold), var(--biscuit-medium))';
            btn.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
            btn.textContent = '✅ クリックで軸設定中';
            canvas.style.cursor = 'crosshair';
        } else {
            btn.style.background = '';
            btn.style.boxShadow = '';
            btn.textContent = '🎯 クリック設定';
            canvas.style.cursor = 'default';
        }
    }
}

// ===== 揺れモーションレイヤーのアンカーポイントクリック処理 =====
function handleBounceAnchorClick(e) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'bounce') {
        console.log('[Bounce Anchor] 揺れモーションレイヤーが選択されていません');
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // 親の変形を考慮したワールド座標を計算
    let worldX = layer.x;
    let worldY = layer.y;
    let worldRotation = layer.rotation;
    let worldScale = layer.scale;
    
    // 親を遡ってワールド座標を計算
    let currentLayer = layer;
    while (currentLayer.parentLayerId) {
        const parent = layers.find(l => l.id === currentLayer.parentLayerId);
        if (!parent) break;
        
        // フォルダの場合（widthとheightがないので簡略化）
        if (parent.type === 'folder') {
            // 親のスケールを適用
            let relX = worldX * parent.scale;
            let relY = worldY * parent.scale;
            
            // 親の回転を適用
            const parentRad = parent.rotation * Math.PI / 180;
            const cos = Math.cos(parentRad);
            const sin = Math.sin(parentRad);
            
            const rotatedX = relX * cos - relY * sin;
            const rotatedY = relX * sin + relY * cos;
            
            // 親の位置を加算
            worldX = rotatedX + parent.x;
            worldY = rotatedY + parent.y;
            worldRotation += parent.rotation;
            worldScale *= parent.scale;
            
            currentLayer = parent;
            continue;
        }
        
        // 画像レイヤーの場合、親の変形を適用
        const parentAnchorOffsetX = parent.anchorX * parent.width;
        const parentAnchorOffsetY = parent.anchorY * parent.height;
        
        // 親のアンカーオフセットを引く
        let relX = worldX - (parentAnchorOffsetX - parent.width / 2);
        let relY = worldY - (parentAnchorOffsetY - parent.height / 2);
        
        // 親のスケールを適用
        relX *= parent.scale;
        relY *= parent.scale;
        
        // 親の回転を適用
        const parentRad = parent.rotation * Math.PI / 180;
        const cos = Math.cos(parentRad);
        const sin = Math.sin(parentRad);
        
        const rotatedX = relX * cos - relY * sin;
        const rotatedY = relX * sin + relY * cos;
        
        // 親の位置を加算
        worldX = rotatedX + parent.x;
        worldY = rotatedY + parent.y;
        worldRotation += parent.rotation;
        worldScale *= parent.scale;
        
        currentLayer = parent;
    }
    
    // ワールド座標でローカル座標に変換
    const rad = -worldRotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const offsetX = (mouseX - worldX) / worldScale;
    const offsetY = (mouseY - worldY) / worldScale;
    
    const localX = offsetX * cos - offsetY * sin;
    const localY = offsetX * sin + offsetY * cos;
    
    // 0-1の範囲に変換
    layer.anchorX = Math.max(0, Math.min(1, (localX + layer.width / 2) / layer.width));
    layer.anchorY = Math.max(0, Math.min(1, (localY + layer.height / 2) / layer.height));
    
    console.log('[Bounce Anchor] アンカーポイント設定:', {
        mouseX, mouseY,
        worldX, worldY,
        localX, localY,
        anchorX: layer.anchorX,
        anchorY: layer.anchorY
    });
    
    // モードを解除
    bounceAnchorClickMode = false;
    canvas.style.cursor = 'default';
    
    // ボタンの表示を更新
    const btn = document.getElementById('tool-anchor');
    if (btn) {
        btn.style.background = '';
        btn.style.boxShadow = '';
        btn.textContent = '🎯 クリック設定';
    }
    
    updatePropertiesPanel();
    render();
}


// ===== 弾み・揺れキーフレーム管理 =====
function generateBounceKeyframeList(layer, type) {
    if (!layer.bounceParams || !layer.bounceParams.keyframes) {
        return '<p style="text-align:center;color:var(--biscuit);padding:10px;font-size:11px;">キーフレームなし</p>';
    }
    
    const keyframes = layer.bounceParams.keyframes.filter(kf => kf.type === type);
    
    if (keyframes.length === 0) {
        return '<p style="text-align:center;color:var(--biscuit);padding:10px;font-size:11px;">キーフレームなし</p>';
    }
    
    return keyframes.map((kf, index) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:var(--chocolate-light);border-radius:4px;margin-bottom:4px;">
            <div style="font-size:11px;color:var(--biscuit-light);">
                ⏱️ フレーム: ${kf.frame}
            </div>
            <button onclick="removeBounceKeyframe(${layer.id}, ${index}, '${type}')" style="padding:4px 8px;background:var(--chocolate-dark);color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">×</button>
        </div>
    `).join('');
}

function addBounceKeyframe(layerId, type) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // bounceParamsを初期化
    if (!layer.bounceParams) {
        layer.bounceParams = getDefaultBounceParams();
    }
    if (!layer.bounceParams.keyframes) {
        layer.bounceParams.keyframes = [];
    }
    // pinsの初期化を追加
    if (!layer.bounceParams.pins) {
        layer.bounceParams.pins = [];
    }
    
    // 現在のフレーム番号を取得
    const currentFrame = Math.floor(currentTime * (typeof projectFPS !== 'undefined' ? projectFPS : 30));
    
    // すでに同じフレームにキーフレームがある場合は削除
    const existingIndex = layer.bounceParams.keyframes.findIndex(kf => kf.frame === currentFrame);
    if (existingIndex !== -1) {
        layer.bounceParams.keyframes.splice(existingIndex, 1);
        console.log('[Bounce Keyframe] 既存削除');
    }
    
    // キーフレームを追加（すべてのパラメータとピン情報、アンカー座標を保存）
    const keyframeData = {
        frame: currentFrame,
        type: layer.bounceParams.type,
        divisions: layer.bounceParams.divisions || 20,
        amplitude: layer.bounceParams.amplitude,
        swayAmplitude: layer.bounceParams.swayAmplitude,
        frequency: layer.bounceParams.frequency,
        dampingTime: layer.bounceParams.dampingTime,
        bounceDirection: layer.bounceParams.bounceDirection,
        swayDirection: layer.bounceParams.swayDirection,
        swayVerticalDirection: layer.bounceParams.swayVerticalDirection || 'both',
        pins: layer.bounceParams.pins ? JSON.parse(JSON.stringify(layer.bounceParams.pins)) : [], // ディープコピー
        // アンカー座標のみ保存（位置は保存しない）
        anchorX: layer.anchorX,
        anchorY: layer.anchorY
    };
    
    layer.bounceParams.keyframes.push(keyframeData);
    
    // フレーム番号順にソート
    layer.bounceParams.keyframes.sort((a, b) => a.frame - b.frame);
    
    console.log(`[Bounce] キーフレーム追加: タイプ=${layer.bounceParams.type}, フレーム=${currentFrame}, ピン数=${keyframeData.pins ? keyframeData.pins.length : 0}`, {
        keyframeData: keyframeData
    });
    
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

function removeBounceKeyframe(layerId, index, type) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.bounceParams || !layer.bounceParams.keyframes) return;
    
    // typeでフィルタリングして実際のインデックスを見つける
    const keyframes = layer.bounceParams.keyframes;
    const typeFilteredIndices = [];
    keyframes.forEach((kf, i) => {
        if (kf.type === type) {
            typeFilteredIndices.push(i);
        }
    });
    
    if (index < typeFilteredIndices.length) {
        const actualIndex = typeFilteredIndices[index];
        layer.bounceParams.keyframes.splice(actualIndex, 1);
    }
    
    updatePropertiesPanel();
    if (typeof updateTimeline === 'function') {
        updateTimeline();
    }
    render();
}

// ===== 現在のタイプでキーフレーム挿入 =====
function addBounceKeyframeFromCurrent() {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'bounce') return;
    
    // 現在選択されているタイプを取得
    const typeSelect = document.getElementById('bounce-type-select');
    const currentType = typeSelect ? typeSelect.value : layer.bounceParams.type;
    
    // 該当タイプのキーフレームを追加
    addBounceKeyframe(layer.id, currentType);
}

// ===== パペットレイヤー用関数 =====

// ===== パペットレイヤー用関数 =====
function updatePuppetStrength(value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (layer && layer.type === 'puppet') {
        layer.puppetStrength = value;
        render();
    }
}

function updatePuppetSmoothness(value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (layer && layer.type === 'puppet') {
        layer.puppetSmoothness = value;
        render();
    }
}

function updateMeshDensity(value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (layer && layer.type === 'puppet') {
        layer.meshDensity = value;
        render();
    }
}

function updateIntermediatePinsList() {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'puppet') return;
    
    const container = document.getElementById('intermediate-pins-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (layer.intermediatePins.length === 0) {
        container.innerHTML = '<p style="font-size: 11px; color: var(--biscuit-light);">中間ピンが追加されていません</p>';
        return;
    }
    
    layer.intermediatePins.forEach((pin, index) => {
        const pinElement = document.createElement('div');
        pinElement.style.cssText = 'padding: 8px; margin-bottom: 6px; background: rgba(147, 112, 219, 0.1); border-radius: 4px; border-left: 3px solid #9370db;';
        
        const keyframeCount = pin.keyframes ? pin.keyframes.length : 0;
        
        pinElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-size: 11px; font-weight: bold; color: #9370db;">📍 ピン${index + 1}</div>
                    <div style="font-size: 10px; color: var(--biscuit-light); margin-top: 2px;">
                        キーフレーム: ${keyframeCount}個
                    </div>
                </div>
                <button onclick="deleteIntermediatePin(layers.find(l => l.id === ${layer.id}), ${pin.id})" 
                    style="padding: 4px 8px; background: var(--chocolate-dark); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                    🗑️ 削除
                </button>
            </div>
        `;
        
        container.appendChild(pinElement);
    });
}

function updateFixedPinsList() {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer || layer.type !== 'puppet') return;
    
    const container = document.getElementById('fixed-pins-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!layer.fixedPins || layer.fixedPins.length === 0) {
        container.innerHTML = '<p style="font-size: 11px; color: var(--biscuit-light);">固定ピンが追加されていません</p>';
        return;
    }
    
    layer.fixedPins.forEach((pin, index) => {
        const pinElement = document.createElement('div');
        pinElement.style.cssText = 'padding: 8px; margin-bottom: 6px; background: rgba(108, 92, 231, 0.1); border-radius: 4px; border-left: 3px solid #6c5ce7;';
        
        pinElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-size: 11px; font-weight: bold; color: #6c5ce7;">🔒 固定ピン${index + 1}</div>
                    <div style="font-size: 10px; color: var(--biscuit-light); margin-top: 4px;">
                        <label>半径: 
                            <input type="number" value="${pin.radius || 100}" min="10" max="500" step="10"
                                onchange="updateFixedPinRadius(${layer.id}, ${pin.id}, parseInt(this.value))"
                                style="width: 60px; padding: 2px 4px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 3px;">
                            px
                        </label>
                    </div>
                </div>
                <button onclick="deleteFixedPin(layers.find(l => l.id === ${layer.id}), ${pin.id})" 
                    style="padding: 4px 8px; background: var(--chocolate-dark); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">
                    🗑️ 削除
                </button>
            </div>
        `;
        
        container.appendChild(pinElement);
    });
}

function updateFixedPinRadius(layerId, pinId, radius) {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.fixedPins) return;
    
    const pin = layer.fixedPins.find(p => p.id === pinId);
    if (pin) {
        pin.radius = radius;
        render();
    }
}

// ===== パペットアンカー追従設定（他のレイヤー用） =====
function generatePuppetFollowUI(layer) {
    const puppetLayers = layers.filter(l => l.type === 'puppet');
    
    if (puppetLayers.length === 0) {
        return '';
    }
    
    const followLayerId = layer.followPuppetAnchor ? layer.followPuppetAnchor.layerId : null;
    
    return `
        <div class="property-group">
            <h4>🎭 パペットアンカーに追従</h4>
            <p style="font-size: 11px; color: var(--biscuit-light); margin-bottom: 8px;">
                💡 パペットレイヤーの変形用ハンドルアンカーに追従します
            </p>
            <label style="font-size: 11px;">
                追従先:
                <select onchange="updatePuppetFollow(this.value)" style="width: 100%; padding: 6px; margin-top: 4px; background: var(--biscuit-dark); color: var(--chocolate-dark); border: 1px solid var(--border-color); border-radius: 4px;">
                    <option value="none" ${!followLayerId ? 'selected' : ''}>なし</option>
                    ${puppetLayers.map(l => 
                        `<option value="${l.id}" ${l.id === followLayerId ? 'selected' : ''}>${l.name} のハンドル</option>`
                    ).join('')}
                </select>
            </label>
        </div>
    `;
}

function updatePuppetFollow(value) {
    const layer = layers.find(l => l.id === selectedLayerIds[0]);
    if (!layer) return;
    
    if (value === 'none') {
        delete layer.followPuppetAnchor;
    } else {
        layer.followPuppetAnchor = {
            layerId: parseInt(value),
            anchorType: 'handle'
        };
    }
    
    updatePropertiesPanel();
    render();
}
