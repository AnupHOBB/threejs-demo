import * as THREE from 'three'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water2.js'
//import { Water } from './node_modules/three/examples/jsm/objects/Water2.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

// Add an environment map
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('envmap.jpg');
//scene.background = texture;

const waterNormalTexture = textureLoader.load('Water_1_M_Normal.jpg')
const waterNormalTexture2 = textureLoader.load('Water_2_M_Normal.jpg')


// Create a green cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const sphereGeometry = new THREE.SphereGeometry(50)
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.BackSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const toRad = d => {return (Math.PI * d)/ 180 }

// Set initial rotation values
let angle = 0;
const tiltAxis = new THREE.Vector3(0, 1, 0);
tiltAxis.applyAxisAngle(new THREE.Vector3(0, 0, -1), toRad(45))

// Position the camera and cube
camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 5;
controls.maxDistance = 50;

const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set(0, 0, 5);
scene.add( directionalLight );

const waterGeometry = new THREE.PlaneGeometry(8, 8)
const water = new Water(waterGeometry, {
    color: new THREE.Color(1, 1, 1),
    scale: 4,
    flowDirection: new THREE.Vector2(1, 1),
    textureWidth: 1024,
    textureheight: 1024,
    normalMap0: waterNormalTexture,
    normalMap1: waterNormalTexture2
})
water.rotation.x = Math.PI * -0.5
water.position.y = -2
scene.add(water)

const groundGeometry = new THREE.PlaneGeometry( 8, 8 );
const groundMaterial = new THREE.MeshStandardMaterial( { color: new THREE.Color(0.2, 0.3, 0.5), roughness: 0.8, metalness: 0.4, map: texture } );
const ground = new THREE.Mesh( groundGeometry, groundMaterial );
ground.rotation.x = Math.PI * - 0.5;
ground.position.y = -2.1
scene.add( ground );

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Resize the canvas to the updated window size
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update cube rotation every 
  angle += 0.01;
  cube.rotateOnAxis(tiltAxis, toRad(1));

  renderer.render(scene, camera);
}
animate();
