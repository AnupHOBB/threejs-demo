import * as THREE from 'three'
import { TextGeometry } from 'text3D'
import { OrbitControls } from 'orbit'
import { LineMaterial } from 'lineMaterial'
import { ENVMAP_PATH } from 'global-constants'
import { FontLoader } from 'loader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3)
const renderer = new THREE.WebGLRenderer({antialias: true});
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

scene.background = new THREE.TextureLoader().load(ENVMAP_PATH);

let mainLine 
let dimension 

const loader = new FontLoader()
loader.load('Roobert Medium_Regular.json', f=>{
    const dimensionLine = new THREE.Group()
    
    let count = 40

    const textGeometry = new TextGeometry(count+'', {
        font: f,
        size: 0.02,
        height: 0.01,
        curveSegments: 16,
        bevelEnabled: false,
        bevelThickness: 0.0125,
        bevelSize: 0.025,
        bevelOffset: 0,
        bevelSegments: 16
    })
    textGeometry.center()
    const textMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(1, 1, 1)})
    let text = new THREE.Mesh(textGeometry, textMaterial)
    text.position.set(0, 0, 0)
    dimensionLine.attach(text)

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.05), new THREE.MeshBasicMaterial({color: new THREE.Color(0, 0, 0), side: THREE.DoubleSide}))
    plane.position.set(0, 0, 0)
    dimensionLine.attach(plane)

    /* const lineMaterial = new LineMaterial({
        color: new THREE.Color(1, 0, 0), 
        vertexColors: true, 
        linewidth: 5, 
        gapSize: 1, 
        dashed: false
    }) */

    const lines = new THREE.Group()

    const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(1, 0, 0), 
        vertexColors: true, 
        linewidth: 5
    })
    lineMaterial.linewidth = 10
    lineMaterial.worldUnits = true
    lineMaterial.needsUpdate = true

    const points = [new THREE.Vector3(-0.2, 0, 0), new THREE.Vector3(0.2, 0, 0)]
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(lineGeometry, lineMaterial)
    //line.computeLineDistances()
    lines.attach(line)

    const endPoints = [new THREE.Vector3(0, -0.02, 0), new THREE.Vector3(0, 0.02, 0)]
    const endLineGeometry = new THREE.BufferGeometry().setFromPoints(endPoints)
    const endLine1 =  new THREE.Line(endLineGeometry, lineMaterial)
    endLine1.position.set(-0.2, 0, 0)
    lines.attach(endLine1)
    
    const endLine2 =  new THREE.Line(endLineGeometry, lineMaterial)
    endLine2.position.set(0.2, 0, 0)
    lines.attach(endLine2)

    dimensionLine.attach(lines)

    lines.rotation.set(0, 0, 0)

    scene.add(dimensionLine)

    mainLine = lines
    dimension = dimensionLine

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()

    setInterval(()=>{
        count++

        let position = text.position
        dimensionLine.remove(text)
        
        const textGeometry = new TextGeometry(count+'', {
            font: f,
            size: 0.02,
            height: 0.01,
            curveSegments: 16,
            bevelEnabled: false,
            bevelThickness: 0.0125,
            bevelSize: 0.025,
            bevelOffset: 0,
            bevelSegments: 16
        })
        textGeometry.center()
        text = new THREE.Mesh(textGeometry, textMaterial)
        text.position.set(position.x, position.y, position.z)
        dimensionLine.attach(text)
    }, 1000)
})

function animate() 
{
    requestAnimationFrame(animate)
    /* if (mainLine != undefined)
        mainLine.scale.x += 0.01
    if (dimension != undefined)
        dimension.position.y -= 0.01 */
    renderer.render(scene, camera)
}