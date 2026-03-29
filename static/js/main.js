// メインエントリーポイント
document.addEventListener('DOMContentLoaded', () => {
    // Three.js シーン初期化
    initScene();
    
    // UIコントロール初期化
    Controls.init();
    
    // 初期状態で3Dオブジェクトを更新
    const initialQ = Controls.getQuaternion();
    setArrowRotation(initialQ);
});
