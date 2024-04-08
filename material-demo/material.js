import * as THREE from 'three'
import { OrbitControls } from 'orbit';
import { ENVMAP_PATH, ENVMAP_TEXTURES } from 'global-constants'

const WOOD_TEXTURE_PATH = '../wood_03.webp'
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(ENVMAP_PATH);

const woodTextureLoader = new THREE.TextureLoader();
const woodTexture = woodTextureLoader.load(WOOD_TEXTURE_PATH);
woodTexture.repeat = new THREE.Vector2(2, 2)

const cubeTextureLoader = new THREE.CubeTextureLoader()
const cubeTexture = cubeTextureLoader.load(ENVMAP_TEXTURES)
//cubeTexture.mapping = THREE.CubeRefractionMapping

//scene.background = cubeTexture

const geometry = new THREE.SphereGeometry();
const materialWood = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.9, 
    metalness: 0,
    map: woodTexture  
});
const sphereWood = new THREE.Mesh(geometry, materialWood);
sphereWood.position.x = -3
scene.add(sphereWood);

const materialGlass = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff, 
    transparent: false, 
    opacity: 1,
    transmission: 1, 
    roughness: 1, 
    metalness: 0,  
    envMap: cubeTexture,
    envMapIntensity: 0.1,
    ior: 1.5,
    reflectivity: 0.05,//0.025,
    specularIntensity: 1,
    iridescence: 0.1,
    iridescenceIOR: 1.5,
    clearcoat: 1,
    thickness: 1
});

const sphereGlass = new THREE.Mesh(geometry, materialGlass);
sphereGlass.position.x = 0
scene.add(sphereGlass);

const materialMetal = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.01, 
    metalness: 0.99, 
    envMap: cubeTexture,
    envMapIntensity: 0.1
});
const sphereMetal = new THREE.Mesh(geometry, materialMetal);
sphereMetal.position.x = 3
scene.add(sphereMetal);

const toRad = d => {return (Math.PI * d)/ 180 }

const backgroundSphereGeometry = new THREE.SphereGeometry(50)
const backgroundSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture,/* envMap:cubeTexture */ side: THREE.BackSide });
const backgroundSphere = new THREE.Mesh(backgroundSphereGeometry, backgroundSphereMaterial);
scene.add(backgroundSphere);
backgroundSphere.rotation.set(toRad(0), 0, 0)

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 5;
controls.maxDistance = 50;

const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
scene.add( ambientLight );

/* const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set(0, 0, 5);
scene.add( directionalLight ); */

const pointLight = new THREE.PointLight( 0xffffff, 1, 10, 2);
pointLight.position.set(0, 0, 5);
scene.add( pointLight );

let fpsElement = document.querySelector('p')
let fpsCounter = 0
setInterval(() => {
    fpsElement.innerHTML = 'FPS: '+fpsCounter
    fpsCounter = 0
}, 1000)

function animate() {
  requestAnimationFrame(animate);
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  fpsCounter++
}
animate();
