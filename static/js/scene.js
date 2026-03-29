// Three.js シーン構築
let scene, camera, renderer, arrow;

function initScene() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // シーン作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16213e);

    // カメラ設定
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(4, 3, 4);
    camera.lookAt(0, 0, 0);

    // レンダラー設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // グリッド
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
    scene.add(gridHelper);

    // 座標軸
    createAxes();

    // 矢印オブジェクト作成
    createArrow();

    // リサイズ対応
    window.addEventListener('resize', onWindowResize);

    // アニメーションループ
    animate();
}

function createAxes() {
    const axisLength = 3;
    const axisRadius = 0.03;

    // X軸 (赤)
    const xGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = axisLength / 2;
    scene.add(xAxis);

    // X軸矢印
    const xConeGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
    const xCone = new THREE.Mesh(xConeGeom, xMaterial);
    xCone.rotation.z = -Math.PI / 2;
    xCone.position.x = axisLength;
    scene.add(xCone);

    // Y軸 (緑)
    const yGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = axisLength / 2;
    scene.add(yAxis);

    // Y軸矢印
    const yConeGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
    const yCone = new THREE.Mesh(yConeGeom, yMaterial);
    yCone.position.y = axisLength;
    scene.add(yCone);

    // Z軸 (青)
    const zGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axisLength / 2;
    scene.add(zAxis);

    // Z軸矢印
    const zConeGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
    const zCone = new THREE.Mesh(zConeGeom, zMaterial);
    zCone.rotation.x = Math.PI / 2;
    zCone.position.z = axisLength;
    scene.add(zCone);

    // 軸ラベル
    addAxisLabels();
}

function addAxisLabels() {
    // ラベルはCanvasで描画してスプライトとして追加
    const labels = [
        { text: 'X', color: '#ff4444', position: [3.3, 0, 0] },
        { text: 'Y', color: '#44ff44', position: [0, 3.3, 0] },
        { text: 'Z', color: '#4444ff', position: [0, 0, 3.3] }
    ];

    labels.forEach(({ text, color, position }) => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(...position);
        sprite.scale.set(0.5, 0.5, 1);
        scene.add(sprite);
    });
}

function createArrow() {
    // 矢印/錨形のオブジェクト
    arrow = new THREE.Group();

    // 本体（胴体）
    const bodyGeom = new THREE.ConeGeometry(0.3, 2, 8);
    const bodyMat = new THREE.MeshPhongMaterial({ 
        color: 0xe94560,
        shininess: 100
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.position.z = 0;
    arrow.add(body);

    // 尾翼（垂直）
    const tailVGeom = new THREE.BoxGeometry(0.05, 0.4, 0.3);
    const tailMat = new THREE.MeshPhongMaterial({ color: 0x00d9ff });
    const tailV = new THREE.Mesh(tailVGeom, tailMat);
    tailV.position.set(0, 0.2, -0.85);
    arrow.add(tailV);

    // 尾翼（水平）
    const tailHGeom = new THREE.BoxGeometry(0.6, 0.05, 0.3);
    const tailH = new THREE.Mesh(tailHGeom, tailMat);
    tailH.position.set(0, 0, -0.85);
    arrow.add(tailH);

    // 主翼
    const wingGeom = new THREE.BoxGeometry(1.5, 0.05, 0.5);
    const wingMat = new THREE.MeshPhongMaterial({ color: 0xff6b8a });
    const wing = new THREE.Mesh(wingGeom, wingMat);
    wing.position.set(0, 0, -0.2);
    arrow.add(wing);

    scene.add(arrow);
}

function setArrowRotation(quaternion) {
    if (arrow) {
        arrow.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    }
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
