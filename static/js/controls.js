// UIコントロール
const Controls = {
    // DOM要素参照
    elements: {},

    // 更新中フラグ（ループ防止）
    isUpdating: false,

    init() {
        // クォータニオン入力
        this.elements.qW = document.getElementById('q-w');
        this.elements.qWNum = document.getElementById('q-w-num');
        this.elements.qX = document.getElementById('q-x');
        this.elements.qXNum = document.getElementById('q-x-num');
        this.elements.qY = document.getElementById('q-y');
        this.elements.qYNum = document.getElementById('q-y-num');
        this.elements.qZ = document.getElementById('q-z');
        this.elements.qZNum = document.getElementById('q-z-num');

        // オイラー角入力
        this.elements.eRoll = document.getElementById('e-roll');
        this.elements.eRollNum = document.getElementById('e-roll-num');
        this.elements.ePitch = document.getElementById('e-pitch');
        this.elements.ePitchNum = document.getElementById('e-pitch-num');
        this.elements.eYaw = document.getElementById('e-yaw');
        this.elements.eYawNum = document.getElementById('e-yaw-num');

        // その他
        this.elements.normalizeBtn = document.getElementById('normalize-btn');
        this.elements.qNorm = document.getElementById('q-norm');
        this.elements.gimbalWarning = document.getElementById('gimbal-warning');
        this.elements.gimbalOk = document.getElementById('gimbal-ok');

        this.bindEvents();
    },

    bindEvents() {
        // クォータニオン スライダー
        ['qW', 'qX', 'qY', 'qZ'].forEach(key => {
            const slider = this.elements[key];
            const numInput = this.elements[key + 'Num'];

            slider.addEventListener('input', () => {
                numInput.value = slider.value;
                this.onQuaternionChange();
            });

            numInput.addEventListener('input', () => {
                slider.value = numInput.value;
                this.onQuaternionChange();
            });
        });

        // オイラー角 スライダー
        ['eRoll', 'ePitch', 'eYaw'].forEach(key => {
            const slider = this.elements[key];
            const numInput = this.elements[key + 'Num'];

            slider.addEventListener('input', () => {
                numInput.value = slider.value;
                this.onEulerChange();
            });

            numInput.addEventListener('input', () => {
                slider.value = numInput.value;
                this.onEulerChange();
            });
        });

        // 正規化ボタン
        this.elements.normalizeBtn.addEventListener('click', () => {
            this.normalizeQuaternion();
        });
    },

    getQuaternion() {
        return {
            w: parseFloat(this.elements.qW.value),
            x: parseFloat(this.elements.qX.value),
            y: parseFloat(this.elements.qY.value),
            z: parseFloat(this.elements.qZ.value)
        };
    },

    getEuler() {
        return {
            roll: parseFloat(this.elements.eRoll.value),
            pitch: parseFloat(this.elements.ePitch.value),
            yaw: parseFloat(this.elements.eYaw.value)
        };
    },

    setQuaternion(q) {
        this.elements.qW.value = q.w.toFixed(3);
        this.elements.qWNum.value = q.w.toFixed(3);
        this.elements.qX.value = q.x.toFixed(3);
        this.elements.qXNum.value = q.x.toFixed(3);
        this.elements.qY.value = q.y.toFixed(3);
        this.elements.qYNum.value = q.y.toFixed(3);
        this.elements.qZ.value = q.z.toFixed(3);
        this.elements.qZNum.value = q.z.toFixed(3);
        this.updateNormDisplay();
    },

    setEuler(e) {
        this.elements.eRoll.value = e.roll.toFixed(1);
        this.elements.eRollNum.value = e.roll.toFixed(1);
        this.elements.ePitch.value = e.pitch.toFixed(1);
        this.elements.ePitchNum.value = e.pitch.toFixed(1);
        this.elements.eYaw.value = e.yaw.toFixed(1);
        this.elements.eYawNum.value = e.yaw.toFixed(1);
        this.updateGimbalWarning(e.pitch);
    },

    updateNormDisplay() {
        const q = this.getQuaternion();
        const norm = Math.sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
        this.elements.qNorm.textContent = norm.toFixed(3);
    },

    updateGimbalWarning(pitch) {
        const isNearGimbalLock = Math.abs(Math.abs(pitch) - 90) < 5;
        this.elements.gimbalWarning.classList.toggle('hidden', !isNearGimbalLock);
        this.elements.gimbalOk.classList.toggle('hidden', isNearGimbalLock);
    },

    async onQuaternionChange() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        this.updateNormDisplay();
        const q = this.getQuaternion();

        try {
            const response = await fetch('/api/quaternion-to-euler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(q)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('API error:', data.error);
                return;
            }
            this.setEuler(data);
            
            // 3D更新
            setArrowRotation(q);
        } catch (err) {
            console.error('変換エラー:', err);
        }

        this.isUpdating = false;
    },

    async onEulerChange() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        const euler = this.getEuler();
        this.updateGimbalWarning(euler.pitch);

        try {
            const response = await fetch('/api/euler-to-quaternion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(euler)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('API error:', data.error);
                return;
            }
            this.setQuaternion(data);
            
            // 3D更新
            setArrowRotation(data);
        } catch (err) {
            console.error('変換エラー:', err);
        }

        this.isUpdating = false;
    },

    async normalizeQuaternion() {
        const q = this.getQuaternion();

        try {
            const response = await fetch('/api/normalize-quaternion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(q)
            });
            const data = await response.json();
            if (!response.ok) {
                console.error('API error:', data.error);
                return;
            }
            this.setQuaternion(data);
            this.onQuaternionChange();
        } catch (err) {
            console.error('正規化エラー:', err);
        }
    }
};
