import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Välj rätt container (vaktrutan)
const lockScreen = document.getElementById('lockScreen');
const canvasContainer = document.getElementById('vaktCanvasContainer');

// Skapa renderer och lägg den INUTI vaktrutan
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
canvasContainer.appendChild(renderer.domElement);

// Setup scen och kamera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.clientWidth / canvasContainer.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 2);
camera.lookAt(0, 0, 0);

// Ambient ljus
const light = new THREE.AmbientLight(0xffffff, 3);
scene.add(light);

// Ladda modellen
const loader = new GLTFLoader();
let model;
loader.load('/models/malegreekwarrior.glb', (gltf) => {
  model = gltf.scene;
  model.position.set(0, 0, 0);
  scene.add(model);
});

// Skapa snö
const snowCount = 2500;
const snowGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(snowCount * 3);
for (let i = 0; i < snowCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = Math.random() * 10;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const snowflakeTexture = new THREE.TextureLoader().load('/assets/snowflake-icon.png');
const snowMaterial = new THREE.PointsMaterial({
  size: 0.2,
  map: snowflakeTexture,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snowParticles);

// Responsivitet
window.addEventListener('resize', () => {
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);

});


// Animation
function animate() {
  requestAnimationFrame(animate);

  // Snörörelse
  const posArray = snowGeometry.attributes.position.array;
  for (let i = 1; i < posArray.length; i += 3) {
    posArray[i] -= 0.01;
    if (posArray[i] < -5) posArray[i] = 5;
  }
  snowGeometry.attributes.position.needsUpdate = true;

  // Rotation på modellen
  if (model) model.rotation.y += 0.003;

  renderer.render(scene, camera);
}
animate();
let clickCount = 0;
const requiredClicks = 10;
const unlockBtn = document.getElementById('unlockBtn');
const clickFeedback = document.getElementById('clickFeedback');


unlockBtn.addEventListener('click', () => {
  clickCount++;

   if (clickCount < requiredClicks) {
    clickFeedback.textContent = `Klick: ${clickCount} / ${requiredClicks}`;

    // Triggera animationen varje gång
    clickFeedback.style.animation = 'none'; // reset
    void clickFeedback.offsetWidth; // tvinga omritning
    clickFeedback.style.animation = 'lock-screen__pulse 0.4s ease';
  } else {
    lockScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});
