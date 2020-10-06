import {
  Injectable
} from '@angular/core';

import * as THREE from 'node_modules/three';
import {
  GLTFLoader
} from 'node_modules/three/examples/jsm/loaders/GLTFLoader';
import {
  BasisTextureLoader
} from 'node_modules/three/examples/jsm/loaders/BasisTextureLoader';
import {
  OrbitControls
} from 'node_modules/three/examples/jsm/controls/OrbitControls';
import {
  Scene
} from 'node_modules/three';


@Injectable({
  providedIn: 'root'
})
export class ModelService {
  canvas: HTMLCanvasElement;
  renderer;

  constructor() {
    // this.canvas = document.querySelector('#canvas');
    // console.log(this.canvas);

    // this.renderer = new THREE.WebGLRenderer({
    //   canvas: this.canvas,
    //   alpha: true // this is important for transparent background
    // });
  }

  public drawModel(): void {
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, this.canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    console.log('first init completed');

    this.loadGltfModel(scene, camera, controls, this.renderer);
    console.log('gltf model loaded');

  }

  loadTexture(scene: Scene): void {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  addLight(scene: Scene): void {
    const skyColor = 0xB1E1FF; // light blue
    const groundColor = 0xB97A20; // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  addLight2(scene: Scene): void {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }

  loadGltfModel(scene: Scene, camera, controls, renderer): void {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/models/stormtrooper.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);

      // compute the box that contains all the stuff
      // from root and below
      // const box = new THREE.Box3().setFromObject(root);

      // const boxSize = box.getSize(new THREE.Vector3()).length();
      // const boxCenter = box.getCenter(new THREE.Vector3());

      // // set the camera to frame the box
      // this.frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      // // update the Trackball controls to handle the new size
      // controls.maxDistance = boxSize * 10;
      // controls.target.copy(boxCenter);
      renderer.render(scene, camera);

      controls.update();
      console.log('gltf callback processed');

    });
  }

  resizeRendererToDisplaySize(renderer): boolean {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  render(renderer, camera, scene): void {
    if (this.resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    // requestAnimationFrame(this.render());
  }

  frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera): void {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }
}
