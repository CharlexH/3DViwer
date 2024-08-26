let scene, camera, renderer, model, controls;
let modelIndex = 0;
const modelList = ['./models/1.glb', './models/2.glb', './models/3.glb'];

function init() {
    // 创建场景
    scene = new THREE.Scene();
  
    // 设置相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);
  
    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);
  
    // 添加灯光
    addLights();
  
    // 加载第一个模型
    loadModel(modelList[modelIndex]);
  
    // 渲染循环
    animate();
  
    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize, false);
  
    // 监听按钮点击
    document.getElementById('prev-model').addEventListener('click', prevModel);
    document.getElementById('next-model').addEventListener('click', nextModel);
  
    // 添加OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
  }
  
  function addLights() {
    // 主光源
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
  
    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);
  
    // 背光
    const rimLight = new THREE.DirectionalLight(0xffffff, 1);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
  
    // 环境光（可选，提供基础照明）
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // 灰色光线
    scene.add(ambientLight);
  }

function loadModel(modelPath) {
    const loader = new THREE.GLTFLoader();
  
    if (model) {
      scene.remove(model);
      disposeModel(model);
    }
  
    loader.load(
      modelPath,
      (gltf) => {
        console.log('模型加载成功:', modelPath);
        model = gltf.scene;
        scene.add(model);
  
        // 计算模型的包围盒
        const box = new THREE.Box3().setFromObject(model);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
  
        // 设置相机位置
        const halfSizeToFitOnScreen = boxSize * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        const direction = new THREE.Vector3()
          .subVectors(camera.position, boxCenter)
          .normalize();
        
        // 调整相机位置以适应模型
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  
        // 确保相机指向模型的中心
        camera.lookAt(boxCenter);
  
        // 如果需要，可以调整controls的目标
        controls.target.copy(boxCenter);
        controls.update();
  
        document.getElementById('model-title').textContent = modelPath;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% 加载完成');
      },
      (error) => {
        console.error('模型加载出错:', error);
      }
    );
  }
  
  function disposeModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update(); // 检查controls是否存在
  if (model) model.rotation.y += 0.005; // 默认旋转
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function prevModel() {
  modelIndex = (modelIndex - 1 + modelList.length) % modelList.length;
  loadModel(modelList[modelIndex]);
}

function nextModel() {
  modelIndex = (modelIndex + 1) % modelList.length;
  loadModel(modelList[modelIndex]);
}

init();