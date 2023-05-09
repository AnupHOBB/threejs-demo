import * as THREE from 'three'
import { OrbitControls } from 'orbit'
import { GLTFLoader } from 'gltf-loader'
import { ENVMAP_PATH } from 'global-constants'

const postOrderTraversal = (mesh, onNode, parentMatrix) => 
{
    if (mesh.children.length > 0)
    {    
        let selfMatrix = new THREE.Matrix4().compose(mesh.position, mesh.quaternion, mesh.scale)
        let matrix 
        if (parentMatrix != undefined)
        {
            let parentMatrixClone = parentMatrix.clone()
            matrix = parentMatrixClone.multiply(selfMatrix)
        }
        else
            matrix = selfMatrix.clone()
        mesh.children.forEach(mesh => postOrderTraversal(mesh, onNode, matrix))
    }
    else
    {
        let meshMatrix = new THREE.Matrix4().compose(mesh.position, mesh.quaternion, mesh.scale)
        let finalMatrix = parentMatrix.multiply(meshMatrix)
        onNode(mesh, finalMatrix)
    }
}

const toRad = d => { return (Math.PI * d)/ 180 }

const createInstanceMatrix = (position, rotation, scale) => 
{
    let matrix = new THREE.Matrix4()
    let quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(rotation)
    return matrix.compose(position, quaternion, scale)
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

let instanceMeshMap = new Map()
let meshModelMatrixMap = new Map()
new GLTFLoader().load('Armchair.glb', (model)=>{
    model.scene.position.set(0, -2, 0)
    postOrderTraversal(model.scene, (mesh, modelMatrix) => {
        if (mesh.isMesh != undefined && mesh.isMesh && mesh.parent != undefined)
        {
            let index = mesh.parent.children.indexOf(mesh)
            if (index >= 0)
            {
                let instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, 3)
                let instanceMatrix1 = createInstanceMatrix(new THREE.Vector3(2, 0, 0), new THREE.Euler(), new THREE.Vector3(1, 1, 1))
                let instanceMatrix2 = createInstanceMatrix(new THREE.Vector3(0, 0, -4), new THREE.Euler(0, toRad(-90), 0), new THREE.Vector3(1, 1, 1))
                let instanceMatrix3 = createInstanceMatrix(new THREE.Vector3(-4, 2, 0), new THREE.Euler(0, toRad(90), 0), new THREE.Vector3(2, 2, 2))
                instancedMesh.setMatrixAt(0, instanceMatrix1.multiply(modelMatrix))
                instancedMesh.setMatrixAt(1, instanceMatrix2.multiply(modelMatrix))
                instancedMesh.setMatrixAt(2, instanceMatrix3.multiply(modelMatrix))
                instanceMeshMap.set(instancedMesh.uuid, instancedMesh)
                meshModelMatrixMap.set(instancedMesh.uuid, modelMatrix.clone())
                instancedMesh.instanceMatrix.needsUpdate = true
                mesh.parent.children[index] = instancedMesh
            }
        }
    })
    scene.add(model.scene)
}, (xhr)=>{}, (error)=>console.log(error))

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(ENVMAP_PATH);

const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.InstancedMesh(cubeGeometry, cubeMaterial, 2);
cube.setMatrixAt(0, createInstanceMatrix(new THREE.Vector3(), new THREE.Euler(), new THREE.Vector3(1, 1, 1)))
cube.setMatrixAt(1, createInstanceMatrix(new THREE.Vector3(0, 0, -5), new THREE.Euler(), new THREE.Vector3(1, 1, 1)))
scene.add(cube)

const sphereGeometry = new THREE.SphereGeometry(1)
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x0088ff, map: texture});
const sphere = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, 2)
sphere.setMatrixAt(0, createInstanceMatrix(new THREE.Vector3(), new THREE.Euler(), new THREE.Vector3(1, 1, 1)))
sphere.setMatrixAt(1, createInstanceMatrix(new THREE.Vector3(0, 0, -5), new THREE.Euler(), new THREE.Vector3(1, 1, 1)))
const sphereGroup = new THREE.Group()
sphereGroup.add(sphere)
sphereGroup.position.set(4, 0, -2)
sphereGroup.rotation.set(0, toRad(1), 0)
scene.add(sphereGroup)

const backgroundSphereGeometry = new THREE.SphereGeometry(50)
const backgorundSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.BackSide });
const backgroundSphere = new THREE.Mesh(backgroundSphereGeometry, backgorundSphereMaterial);
scene.add(backgroundSphere);

let angle = 0;
const tiltAxis = new THREE.Vector3(0, 1, 0);
tiltAxis.applyAxisAngle(new THREE.Vector3(0, 0, -1), toRad(45))

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 5;
controls.maxDistance = 50;

const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set(0, 0, 5);
scene.add( directionalLight );

let counter = 0
let counterlimit = 2000
let decrement = true

let fpsElement = document.querySelector('p')
let fpsCounter = 0
setInterval(() => {
    fpsElement.innerHTML = 'FPS: '+fpsCounter
    fpsCounter = 0
}, 1000)

function animate() 
{
    requestAnimationFrame(animate);

    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight);

    let quaternion = new THREE.Quaternion()
    quaternion.setFromAxisAngle(tiltAxis, toRad(angle)) 

    angle += 1
    cube.setMatrixAt(0, new THREE.Matrix4().compose(new THREE.Vector3(), quaternion, new THREE.Vector3(1, 1, 1)))
    cube.setMatrixAt(1, new THREE.Matrix4().compose(new THREE.Vector3(0, 0, -5), quaternion, new THREE.Vector3(1, 1, 1)))
    cube.instanceMatrix.needsUpdate = true
    sphere.setMatrixAt(0, createInstanceMatrix(new THREE.Vector3(), new THREE.Euler(), new THREE.Vector3(1, 1, 1)))
    sphere.setMatrixAt(1, new THREE.Matrix4().compose(new THREE.Vector3(0, 0, -5), quaternion, new THREE.Vector3(1, 1, 1)))
    sphere.instanceMatrix.needsUpdate = true

    if (decrement)
    {
        if (counter < counterlimit)
        {
            sphereGroup.position.x -= 0.005
            counter++
        }
        else
        {
            sphereGroup.position.x += 0.005
            decrement = false
        }
    }
    else
    {
        if (counter > 0)
        {
            sphereGroup.position.x += 0.005
            counter--
        }
        else
        {
            sphereGroup.position.x -= 0.005
            decrement = true
        }
    }

    let instanceMeshIds = instanceMeshMap.keys()
    for (let uuid of instanceMeshIds)
    {
        let modelMatrix = meshModelMatrixMap.get(uuid).clone()
        let instancedMesh = instanceMeshMap.get(uuid)
        let quaternion2 = new THREE.Quaternion()
        quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), toRad(angle))
        let quaternion3 = new THREE.Quaternion()
        quaternion3.setFromAxisAngle(new THREE.Vector3(0, -1, 0), toRad(angle)) 
        let instanceMatrix1 = createInstanceMatrix(new THREE.Vector3(2, 0, 0), new THREE.Euler(), new THREE.Vector3(1, 1, 1))
        let instanceMatrix2 = new THREE.Matrix4().compose(new THREE.Vector3(0, 0, -4), quaternion2, new THREE.Vector3(1, 1, 1))
        let instanceMatrix3 = new THREE.Matrix4().compose(new THREE.Vector3(-4, 2, 0), quaternion3, new THREE.Vector3(2, 2, 2))
        instancedMesh.setMatrixAt(0, instanceMatrix1.multiply(modelMatrix))
        instancedMesh.setMatrixAt(1, instanceMatrix2.multiply(modelMatrix))
        instancedMesh.setMatrixAt(2, instanceMatrix3.multiply(modelMatrix))
        instancedMesh.instanceMatrix.needsUpdate = true
    }

    renderer.render(scene, camera);
    fpsCounter++
}
animate();
