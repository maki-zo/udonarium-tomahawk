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
  private dice: THREE.Group[] = [];
  private dieSides: number = 20;
  private diceStates: {
  die: THREE.Group;
  sides: number;
  targetValue: number;

  velocityX: number;
  velocityY: number;

  angularVelocityX: number;
  angularVelocityY: number;
  angularVelocityZ: number;

  faceNormals: THREE.Vector3[];

  settling: boolean;
  targetQuaternion: THREE.Quaternion | null;
}[] = [];
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
// D20生成
// -----------------------------

const die = this.createD20();

scene.add(die);

// 起動直後は非表示
die.visible = false;

this.die = die;
this.dice.push(die);

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
          const diceResults = rands.filter(
  rand => rand.kind === 'normal'
);

console.log(
  '[Tomahawk 3D Dice Results]',
  diceResults
);
// 複数D20表示テスト
if (
  diceResults.length > 1 &&
  diceResults.every(
    rand => rand.sides === 20
  )
) {

  // 以前のテスト用ダイスが残っていれば削除
  for (const oldDie of this.dice.slice(1)) {
    scene.remove(oldDie);
  }

  // 最初のD20だけ残す
  this.dice = this.dice.slice(0, 1);

  // 2個目以降を生成
  for (
    let i = 1;
    i < diceResults.length;
    i++
  ) {
   const faceNormals: THREE.Vector3[] = [];

const extraDie =
  this.createD20(faceNormals);

const result =
  diceResults[i];

extraDie.position.set(
  -1.0 + i * 1.0,
  0.5,
  0
);

this.diceStates.push({
  die: extraDie,
  sides: result.sides,
  targetValue: result.value,

velocityX: 0.018 + i * 0.003,
  velocityY: 0.045 + i * 0.004,

  angularVelocityX: 0.12 + i * 0.01,
  angularVelocityY: 0.16 + i * 0.01,
  angularVelocityZ: 0.10 + i * 0.01,

  faceNormals: faceNormals,

  settling: false,
  targetQuaternion: null
});

    extraDie.visible = true;

    scene.add(extraDie);
    this.dice.push(extraDie);
  }
}
this.targetValue = rands[0].value;
this.dieSides = rands[0].sides;

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
  // 2個目以降のダイスも出目へ収束させる
for (const state of this.diceStates) {

  state.angularVelocityX = 0;
  state.angularVelocityY = 0;
  state.angularVelocityZ = 0;

  state.velocityX = 0;
  state.velocityY = 0;

  state.die.position.y = -2.4;

  this.orientDiceStateToValue(state);
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
// 複数ダイスを動かす
for (const state of this.diceStates) {

  const extraDie = state.die;

  if (
    state.settling &&
    state.targetQuaternion
  ) {
    extraDie.quaternion.slerp(
      state.targetQuaternion,
      0.12
    );
  } else {
    extraDie.rotation.x +=
      state.angularVelocityX;

    extraDie.rotation.y +=
      state.angularVelocityY;

    extraDie.rotation.z +=
      state.angularVelocityZ;
  }

  extraDie.position.x +=
    state.velocityX;

  extraDie.position.y +=
    state.velocityY;

  // 重力
  state.velocityY -= 0.005;

  // 床でバウンド
  if (
    extraDie.position.y <= -2.4 &&
    state.velocityY < 0
  ) {
    extraDie.position.y = -2.4;

    state.velocityY =
      -state.velocityY * 0.55;

    state.velocityX *= 0.88;

    state.angularVelocityX *= 0.72;
    state.angularVelocityY *= 0.72;
    state.angularVelocityZ *= 0.72;
  }

  // 小さなバウンドを止める
  if (
  extraDie.position.y <= -2.4 &&
  Math.abs(state.velocityY) < 0.008
) {
  extraDie.position.y = -2.4;
  state.velocityY = 0;

  // 横移動も徐々に止める
  state.velocityX *= 0.90;

  if (Math.abs(state.velocityX) < 0.002) {
    state.velocityX = 0;
  }
}
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

private orientDiceStateToValue(
  state: {
    die: THREE.Group;
    sides: number;
    targetValue: number;
    velocityX: number;
    velocityY: number;
    angularVelocityX: number;
    angularVelocityY: number;
    angularVelocityZ: number;
    faceNormals: THREE.Vector3[];
    settling: boolean;
    targetQuaternion: THREE.Quaternion | null;
  }
): void {

  const faceNormal =
    state.faceNormals[state.targetValue - 1];

  if (!faceNormal) {
    return;
  }

  state.targetQuaternion =
    new THREE.Quaternion().setFromUnitVectors(
      faceNormal.clone().normalize(),
      new THREE.Vector3(0, 1, 0)
    );

  state.settling = true;
}
private createD20(
  faceNormals?: THREE.Vector3[]
): THREE.Group {

  const geometry =
    new THREE.IcosahedronGeometry(0.24, 0);

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.15,
      flatShading: true
    });

  const dieMesh =
    new THREE.Mesh(
      geometry,
      material
    );

  const die =
    new THREE.Group();

  die.add(dieMesh);

  const position =
    geometry.getAttribute('position');

  const faceCount =
    position.count / 3;

  for (
    let faceIndex = 0;
    faceIndex < faceCount;
    faceIndex++
  ) {

    const i = faceIndex * 3;

    const a =
      new THREE.Vector3()
        .fromBufferAttribute(position, i);

    const b =
      new THREE.Vector3()
        .fromBufferAttribute(position, i + 1);

    const c =
      new THREE.Vector3()
        .fromBufferAttribute(position, i + 2);

    const faceCenter =
      new THREE.Vector3()
        .add(a)
        .add(b)
        .add(c)
        .divideScalar(3);

    const faceNormal =
      new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(b, a),
          new THREE.Vector3().subVectors(c, a)
        )
        .normalize();
if (faceNormals) {
  faceNormals[faceIndex] =
    faceNormal.clone();
} else {
  this.faceNormals[faceIndex] =
    faceNormal.clone();
}
    const faceNumber =
      faceIndex + 1;

    const canvas =
      document.createElement('canvas');

    canvas.width = 256;
    canvas.height = 256;

    const ctx =
      canvas.getContext('2d');

    if (!ctx) {
      continue;
    }

    ctx.clearRect(
      0,
      0,
      256,
      256
    );

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
      new THREE.PlaneGeometry(
        0.10,
        0.10
      );

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
        faceNormal
          .clone()
          .multiplyScalar(0.003)
      )
    );

    numberMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      faceNormal
    );

    die.add(numberMesh);
  }

  return die;
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