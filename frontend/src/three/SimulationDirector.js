/**
 * SimulationDirector.js — Three.js WebGL scene for branching universes.
 * Used directly (not via R3F) for full imperative control.
 */
import * as THREE from 'three';

const UNIVERSE_COLORS = { A: 0xff4466, B: 0xffb830, C: 0x00ff8c };

export class SimulationDirector {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animFrameId = null;
    this.branches = {};
    this.halos = [];
    this.particles = null;
    this.clock = new THREE.Clock();
    this._init();
  }

  _init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050810, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      60, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000
    );
    this.camera.position.set(0, 5, 22);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x050810, 1);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x112244, 0.8));
    const pt = new THREE.PointLight(0x00e5ff, 1.5, 50);
    pt.position.set(0, 10, 5);
    this.scene.add(pt);

    this._buildParticleField();
    this._buildStarfield();
    this._animate();

    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(this.canvas);
  }

  _buildParticleField() {
    const count = 3000;
    const pos = new Float32Array(count * 3).map(() => (Math.random() - 0.5) * 4);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(
      geo, new THREE.PointsMaterial({ color: 0x4078ff, size: 0.04, transparent: true, opacity: 0.7 })
    );
    this.scene.add(this.particles);
  }

  _buildStarfield() {
    const count = 6000;
    const pos = new Float32Array(count * 3).map(() => (Math.random() - 0.5) * 400);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(
      geo, new THREE.PointsMaterial({ color: 0x8ab0ff, size: 0.3, transparent: true, opacity: 0.6 })
    ));
  }

  buildBranch(universeId, index, total) {
    const spread = 7;
    const angle = ((index / (total - 1)) - 0.5) * Math.PI * 0.8;
    const endX = Math.sin(angle) * spread;
    const endY = 2 + Math.random() * 2;
    const endZ = -8 - Math.random() * 4;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(endX * 0.4, endY * 0.5, endZ * 0.3),
      new THREE.Vector3(endX, endY, endZ),
    ]);

    const geo = new THREE.TubeGeometry(curve, 64, 0.06, 8, false);
    const color = UNIVERSE_COLORS[universeId] ?? 0x4078ff;
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const tube = new THREE.Mesh(geo, mat);
    this.scene.add(tube);
    this.branches[universeId] = { tube, endX, endY, endZ };
    this._animateBranchGrow(tube, geo, index * 400);
    this._addHalo(endX, endY, endZ, color);
    this._addLabel(universeId, endX, endY + 1.2, endZ, color);
  }

  _animateBranchGrow(tube, geo, delay) {
    setTimeout(() => {
      geo.setDrawRange(0, 0);
      tube.material.opacity = 0.85;
      const total = geo.attributes.position.count;
      let drawn = 0;
      const step = () => {
        drawn = Math.min(drawn + Math.ceil(total / 60), total);
        geo.setDrawRange(0, drawn);
        if (drawn < total) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  }

  _addHalo(x, y, z, color) {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.04, 8, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
    );
    halo.position.set(x, y, z);
    this.scene.add(halo);
    this.halos.push(halo);
  }

  _addLabel(id, x, y, z, color) {
    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 48;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
    ctx.font = 'bold 28px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`U-${id}`, 64, 34);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    sprite.position.set(x, y, z);
    sprite.scale.set(1.5, 0.56, 1);
    this.scene.add(sprite);
  }

  focusBranch(id) {
    const b = this.branches[id];
    if (b) this._lerp(this.camera.position, new THREE.Vector3(b.endX, b.endY, b.endZ + 6), 60);
  }

  resetCamera() {
    this._lerp(this.camera.position, new THREE.Vector3(0, 5, 22), 60);
  }

  _lerp(pos, target, steps) {
    let s = 0;
    const tick = () => { pos.lerp(target, 0.06); if (++s < steps) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate());
    const t = this.clock.getElapsedTime();
    if (this.particles) {
      this.particles.rotation.y = t * 0.05;
      this.particles.rotation.x = Math.sin(t * 0.03) * 0.1;
    }
    this.halos.forEach((h, i) => {
      h.scale.setScalar(1 + Math.sin(t * 2 + i * 1.2) * 0.1);
      h.rotation.z = t * 0.5;
    });
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this._ro) this._ro.disconnect();
    this.renderer?.dispose();
  }
}
