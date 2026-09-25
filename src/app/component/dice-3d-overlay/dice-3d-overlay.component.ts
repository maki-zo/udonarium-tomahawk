import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import * as THREE from 'three';
import { EventSystem } from '@udonarium/core/system';

@Component({
  selector: 'dice-3d-overlay',
  template: '<div #host class="dice-3d-host"></div>',
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10000;
    }

    .dice-3d-host {
      width: 100%;
      height: 100%;
    }
  `]
})
export class Dice3dOverlayComponent implements AfterViewInit, OnDestroy {

  @ViewChild('host', { static: true })
  private host!: ElementRef<HTMLDivElement>;

  private renderer: THREE.WebGLRenderer | null = null;
  private animationFrameId: number | null = null;
  private listener: any = null;
  private die: THREE.Group | null = null;
private velocityX: number = 0;
private velocityY: number = 0;
private angularVelocityX: number = 0;
private angularVelocityY: number = 0;
private angularVelocityZ: number = 0;
private targetValue: number = 1;
private faceNormals: THREE.Vector3[] = [];
private settling: boolean = false;
private targetQuaternion: THREE.Quaternion | null = null;
ngAfterViewInit(): void {

  // -----------------------------
  // Three.js 初期化
  // -----------------------------

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.host.nativeElement.appendChild(
      renderer.domElement
    );

    this.renderer = renderer;

    // -----------------------------
    // 仮D20
    // -----------------------------

    const geometry = new THREE.IcosahedronGeometry(0.24, 0);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.15,
      flatShading: true
    });

    const dieMesh = new THREE.Mesh(
  geometry,
  material
);

const die = new THREE.Group();

die.add(dieMesh);
// -----------------------------
// D20 数字表示テスト
// -----------------------------

const numberCanvas = document.createElement('canvas');
numberCanvas.width = 256;
numberCanvas.height = 256;

const numberCtx = numberCanvas.getContext('2d');

if (numberCtx) {
  numberCtx.clearRect(0, 0, 256, 256);

  numberCtx.fillStyle = '#000000';
  numberCtx.font = 'bold 150px Arial';
  numberCtx.textAlign = 'center';
  numberCtx.textBaseline = 'middle';

  numberCtx.fillText('1', 128, 138);
}

const numberTexture =
  new THREE.CanvasTexture(numberCanvas);

  const position =
  geometry.getAttribute('position');
const faceCount = position.count / 3;

console.log(
  '[Tomahawk D20] faceCount =',
  faceCount
);

for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {

  const i = faceIndex * 3;

  const a =
    new THREE.Vector3().fromBufferAttribute(position, i);

  const b =
    new THREE.Vector3().fromBufferAttribute(position, i + 1);

  const c =
    new THREE.Vector3().fromBufferAttribute(position, i + 2);

  const faceCenter = new THREE.Vector3()
    .add(a)
    .add(b)
    .add(c)
    .divideScalar(3);

  const faceNormal = new THREE.Vector3()
    .crossVectors(
      new THREE.Vector3().subVectors(b, a),
      new THREE.Vector3().subVectors(c, a)
    )
    .normalize();
this.faceNormals[faceIndex] = faceNormal.clone();
  // この面に表示する数字
  const faceNumber = faceIndex + 1;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    continue;
  }

  ctx.clearRect(0, 0, 256, 256);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 150px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(
    String(faceNumber),
    128,
    138
  );

  const texture =
    new THREE.CanvasTexture(canvas);

  const numberGeometry =
    new THREE.PlaneGeometry(0.10, 0.10);

  const numberMaterial =
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

  const numberMesh =
    new THREE.Mesh(
      numberGeometry,
      numberMaterial
    );

  numberMesh.position.copy(
    faceCenter.clone().add(
      faceNormal.clone().multiplyScalar(0.003)
    )
  );

  numberMesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    faceNormal
  );

  die.add(numberMesh);
}

scene.add(die);

// 起動直後は非表示
die.visible = false;

this.die = die;

    // -----------------------------
    // ライト
    // -----------------------------

    const ambientLight =
      new THREE.AmbientLight(0xffffff, 0.8);

    scene.add(ambientLight);

    const mainLight =
      new THREE.DirectionalLight(0xffffff, 1.4);

    mainLight.position.set(4, 6, 8);

    scene.add(mainLight);

    // -----------------------------
    // BCDiceイベント受信
    // -----------------------------

    this.listener = EventSystem.register(this)
      .on('DICE_CUT_IN_STRUCTURED', event => {

        const rands =
          event.data?.rollResult?.detailedRands;

        console.log(
          '[Tomahawk 3D Dice Overlay]',
          rands
        );

        if (
          this.die &&
          Array.isArray(rands) &&
          rands.length > 0 &&
          rands[0].sides === 20
        ) {
          // D20を振った時だけ表示
this.targetValue = rands[0].value;

this.settling = false;
this.targetQuaternion = null;

this.die.visible = true;
this.die.rotation.set(
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2
);
this.die.position.set(-4, 1.5, 0);

this.velocityX = 0.060;
this.velocityY = 0.045;
this.angularVelocityX = 0.12;
this.angularVelocityY = 0.16;
this.angularVelocityZ = 0.10;
          // 5秒後に消す
setTimeout(() => {
  if (this.die) {

    this.angularVelocityX = 0;
    this.angularVelocityY = 0;
    this.angularVelocityZ = 0;

    this.velocityX = 0;
    this.velocityY = 0;

    this.die.position.y = -2.4;

    this.orientDieToValue(
      this.targetValue
    );
  }
}, 3000);
        }
      });

    // -----------------------------
    // 描画ループ
    // -----------------------------

    const animate = () => {

die.rotation.x += this.angularVelocityX;
die.rotation.y += this.angularVelocityY;
die.rotation.z += this.angularVelocityZ;
if (
  this.settling &&
  this.targetQuaternion
) {
  die.quaternion.slerp(
    this.targetQuaternion,
    0.12
  );
}
die.position.x += this.velocityX;
die.position.y += this.velocityY;
this.velocityY -= 0.005;
if (die.position.y <= -2.4 && this.velocityY < 0) {
  die.position.y = -2.4;
  this.velocityY = -this.velocityY * 0.55;
  this.velocityX *= 0.88;
  this.angularVelocityX *= 0.72;
this.angularVelocityY *= 0.72;
this.angularVelocityZ *= 0.72;
  }
  if (
  die.position.y <= -2.4 &&
  Math.abs(this.velocityY) < 0.008
) {
  die.position.y = -2.4;
  this.velocityY = 0;
}
      renderer.render(
        scene,
        camera
      );

      this.animationFrameId =
        requestAnimationFrame(animate);
    };

    animate();
  }
private orientDieToValue(value: number): void {

  if (!this.die) {
    return;
  }

  const faceNormal =
    this.faceNormals[value - 1];

  if (!faceNormal) {
    return;
  }

  const targetDirection =
    new THREE.Vector3(0, 1, 0);

  this.targetQuaternion =
    new THREE.Quaternion().setFromUnitVectors(
      faceNormal.clone().normalize(),
      targetDirection
    );

  this.settling = true;
}
  ngOnDestroy(): void {

    if (this.listener) {
      EventSystem.unregister(this.listener);
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(
        this.animationFrameId
      );
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}