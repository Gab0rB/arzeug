import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2
} from '@angular/core';
import * as tracking from './tracking';
import './tracking/build/data/face';
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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'ar-test';

  @ViewChild('video', {
    static: true
  }) videoElement: ElementRef;
  @ViewChild('canvas', {
    static: true
  }) canvas: ElementRef;

  canv;
  webGlRenderer;
  camera;
  controls;
  scene;
  gltfLoader = new GLTFLoader();

  models = [];

  constraints = {
    video: {
      facingMode: 'environment',
      width: {
        ideal: 4096
      },
      height: {
        ideal: 2160
      }
    }
  };


  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.startCamera();
    this.initModelLoader();
    const colors = new tracking.ColorTracker(['yellow']);
    // console.log('start tracking');



    colors.on('track', (event) => {
      // console.log('yellow found!! wohoo');
      // console.log(event);

      if (event.data.length === 0) {
        // No colors were detected in this frame.
      } else {
        event.data.forEach((rect) => {
          // console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
        });
      }
    });

    const objects = new tracking.ObjectTracker(['face']);

    objects.on('track', (event) => {
      if (event.data.length === 0) {
        this.clearScene();
      } else {
        event.data.forEach((rect) => {
          console.log('face found!!');
          console.log(rect);
          // rect:
          // height: 119
          // total: 1
          // width: 119
          // x: 702
          // y: 900
          // this.modelService.drawModel();
          if (this.models[0]) {
            const scene = this.models[0].scene;
            console.log(scene);

            scene.position.set(3, 1, 0);
            this.scene.add(scene);
            this.webGlRenderer.render(this.scene, this.camera);
          }
          // this.controls.update();

          console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
        });
      }
    });

    tracking.track('#myVideo', colors);
    tracking.track('#myVideo', objects);
    // this.drawModel();
  }

  initModelLoader(): void {
    this.canv = document.querySelector('#canvas');
    this.webGlRenderer = new THREE.WebGLRenderer({
      canvas: this.canv,
      alpha: true // this is important for transparent background
    });
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 10, 20);
    this.controls = new OrbitControls(this.camera, this.canv);
    this.controls.target.set(0, 5, 0);
    this.controls.update();
    this.scene = new THREE.Scene();
    this.loadGltfModel('stormtrooper');
  }

  loadGltfModel(modelName): void {
    this.gltfLoader.load('assets/models/' + modelName + '.gltf', (gltf) => {
      this.models.push({
        name: modelName,
        scene: gltf.scene
      });
    });
  }

  clearScene(): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.webGlRenderer.render(this.scene, this.camera);
    // this.controls.update();
  }

  startCamera(): void {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    } else {
      alert('Sorry, camera not available.');
    }
  }

  attachVideo(stream): void {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  }

  handleError(error): void {
    console.log('Error: ', error);
  }
}
