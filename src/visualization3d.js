import * as THREE from "three";

export class Visualization3D {
  constructor(gridWidth, gridHeight, torusRadius, tubeRadius) {
    this.GRID_WIDTH = gridWidth;
    this.GRID_HEIGHT = gridHeight;
    this.TORUS_RADIUS = torusRadius;
    this.TUBE_RADIUS = tubeRadius;

    this.cellMeshes = [];
    this.zoomOutAnimation = { active: true, startTime: null, duration: 8000 };
    this.rotationX = 0;
    this.rotationY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.initScene();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 8, 5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("container").appendChild(this.renderer.domElement);

    this.setupMouseControls();

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 15, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    const torusGeometry = new THREE.TorusGeometry(
      this.TORUS_RADIUS,
      this.TUBE_RADIUS,
      16,
      100
    );
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    this.torusWireframe = new THREE.Mesh(torusGeometry, torusMaterial);
    this.scene.add(this.torusWireframe);

    this.createGridLines();

    window.addEventListener("resize", () => this.onWindowResize());
  }

  // ========================================
  // GEOMETRY
  // ========================================

  createGridLines() {
    this.gridGroup = new THREE.Group();
    this.scene.add(this.gridGroup);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i <= this.GRID_HEIGHT; i++) {
      const points = [];
      for (let j = 0; j <= this.GRID_WIDTH; j++) {
        const pos = this.getTorusPosition(i, j);
        points.push(pos);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.gridGroup.add(line);
    }

    for (let j = 0; j <= this.GRID_WIDTH; j++) {
      const points = [];
      for (let i = 0; i <= this.GRID_HEIGHT; i++) {
        const pos = this.getTorusPosition(i, j);
        points.push(pos);
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.gridGroup.add(line);
    }
  }

  createCellMeshes() {
    if (this.cellGroup) {
      this.scene.remove(this.cellGroup);
    }

    this.cellGroup = new THREE.Group();
    this.scene.add(this.cellGroup);

    this.aliveMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x004400,
      side: THREE.DoubleSide,
    });
    this.deadMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    this.cellMeshes = [];
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      this.cellMeshes[i] = [];
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        const v = (i / this.GRID_HEIGHT) * Math.PI * 2;

        const segmentWidth =
          (this.TORUS_RADIUS + this.TUBE_RADIUS * Math.cos(v)) *
          ((Math.PI * 2) / this.GRID_WIDTH) *
          0.9;
        const segmentHeight =
          this.TUBE_RADIUS * ((Math.PI * 2) / this.GRID_HEIGHT) * 0.9;

        const cellGeometry = new THREE.PlaneGeometry(
          segmentWidth,
          segmentHeight
        );
        const mesh = new THREE.Mesh(cellGeometry, this.deadMaterial);

        const position = this.getTorusPosition(i, j);
        mesh.position.copy(position);

        // Apply proper surface orientation to the cell mesh
        this.orientCellOnTorusSurface(mesh, i, j);

        mesh.userData = { i, j };

        this.cellGroup.add(mesh);
        this.cellMeshes[i][j] = mesh;
      }
    }
  }

  // ========================================
  // TORUS GEOMETRY
  // ========================================

  // Torus parameterization: Maps 2D grid coordinates to 3D torus surface
  // Standard torus parametric equations:
  // - u (angle around the major radius): varies from 0 to 2π as j goes from 0 to GRID_WIDTH
  // - v (angle around the minor radius): varies from 0 to 2π as i goes from 0 to GRID_HEIGHT
  // - Major radius (TORUS_RADIUS): distance from center to tube center
  // - Minor radius (TUBE_RADIUS): radius of the tube itself
  getTorusPosition(i, j) {
    const u = (j / this.GRID_WIDTH) * Math.PI * 2; // Angle around major circumference
    const v = (i / this.GRID_HEIGHT) * Math.PI * 2; // Angle around tube circumference

    // Parametric torus equations:
    // x = (R + r*cos(v)) * cos(u)
    // y = (R + r*cos(v)) * sin(u)
    // z = r * sin(v)
    const x =
      (this.TORUS_RADIUS + this.TUBE_RADIUS * Math.cos(v)) * Math.cos(u);
    const y =
      (this.TORUS_RADIUS + this.TUBE_RADIUS * Math.cos(v)) * Math.sin(u);
    const z = this.TUBE_RADIUS * Math.sin(v);

    return new THREE.Vector3(x, y, z);
  }

  // Cell surface orientation: Aligns each cell mesh with the local torus surface geometry
  // This ensures cells appear naturally embedded on the curved torus surface rather than floating
  orientCellOnTorusSurface(mesh, i, j) {
    const u = (j / this.GRID_WIDTH) * Math.PI * 2; // Major angle parameter
    const v = (i / this.GRID_HEIGHT) * Math.PI * 2; // Minor angle parameter

    // SURFACE NORMAL CALCULATION:
    // The normal vector points outward from the torus surface, perpendicular to the surface
    // For a torus r(u,v) = ((R + r*cos(v))*cos(u), (R + r*cos(v))*sin(u), r*sin(v))
    // The normal is computed as the normalized cross product: (∂r/∂u) × (∂r/∂v)
    //
    // ∂r/∂u = (-(R + r*cos(v))*sin(u), (R + r*cos(v))*cos(u), 0)
    // ∂r/∂v = (-r*sin(v)*cos(u), -r*sin(v)*sin(u), r*cos(v))
    //
    // After cross product and normalization, the unit normal becomes:
    const normal = new THREE.Vector3(
      Math.cos(u) * Math.cos(v), // Points radially outward in xy-plane, scaled by tube position
      Math.sin(u) * Math.cos(v), // Points radially outward in xy-plane, scaled by tube position
      Math.sin(v) // Points vertically, following tube curvature
    );

    // TANGENT VECTOR IN V-DIRECTION:
    // This tangent vector follows the circumference of the tube (minor radius direction)
    // It's perpendicular to the normal and defines the "up" direction for cell orientation
    // Calculated as ∂r/∂v normalized: the rate of change as we move around the tube
    const tangentV = new THREE.Vector3(
      -Math.sin(v) * Math.cos(u), // Component pointing inward toward major axis
      -Math.sin(v) * Math.sin(u), // Component pointing inward toward major axis
      Math.cos(v) // Vertical component following tube curve
    );

    // SET MESH ORIENTATION:
    // 1. Set the "up" vector to align with the tube's circumferential direction
    //    This ensures cells don't appear twisted relative to the surface
    mesh.up.copy(tangentV);

    // 2. Point the mesh "forward" direction along the surface normal
    //    This makes cells face outward from the torus surface
    //    The lookAt() method orients the mesh's -z axis toward the target point
    const position = mesh.position.clone();
    mesh.lookAt(position.add(normal));

    // RESULT: Each cell is now properly oriented with:
    // - Its face perpendicular to the torus surface (facing outward)
    // - Its "up" direction aligned with the local tube circumference
    // - Smooth transitions between adjacent cells following surface curvature
  }

  // ========================================

  setupMouseControls() {
    let isMouseDown = false;
    let mouseX = 0,
      mouseY = 0;

    this.renderer.domElement.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    this.renderer.domElement.addEventListener("mousemove", (e) => {
      if (isMouseDown) {
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        this.targetRotationY += deltaX * 0.01;
        this.targetRotationX += deltaY * 0.01;

        mouseX = e.clientX;
        mouseY = e.clientY;
      }
    });

    this.renderer.domElement.addEventListener("mouseup", () => {
      isMouseDown = false;
    });

    this.renderer.domElement.addEventListener("wheel", (e) => {
      if (!this.zoomOutAnimation.active) {
        const scale = e.deltaY > 0 ? 1.1 : 0.9;
        this.camera.position.multiplyScalar(scale);
        this.camera.position.clampLength(10, 50);
      }
    });
  }

  updateVisualization(gameState) {
    for (let i = 0; i < this.GRID_HEIGHT; i++) {
      for (let j = 0; j < this.GRID_WIDTH; j++) {
        const mesh = this.cellMeshes[i][j];
        const isAlive = gameState[i][j] === 1;

        if (isAlive) {
          mesh.material = this.aliveMaterial;
          mesh.scale.setScalar(1.0);
        } else {
          mesh.material = this.deadMaterial;
          mesh.scale.setScalar(0.8);
        }
      }
    }
  }

  animate() {
    this.updateCameraRotation();
    this.updateZoomAnimation();
    this.updateObjectRotations();
    this.renderer.render(this.scene, this.camera);
  }

  updateCameraRotation() {
    this.rotationX += (this.targetRotationX - this.rotationX) * 0.05;
    this.rotationY += (this.targetRotationY - this.rotationY) * 0.05;
  }

  updateZoomAnimation() {
    if (this.zoomOutAnimation.active) {
      const now = Date.now();
      if (!this.zoomOutAnimation.startTime) {
        this.zoomOutAnimation.startTime = now;
      }

      const elapsed = now - this.zoomOutAnimation.startTime;
      const progress = Math.min(elapsed / this.zoomOutAnimation.duration, 1);

      // Smoother easing function (ease-in-out cubic)
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate camera distance from close to far
      const startDistance = 8;
      const endDistance = 28;
      const distance =
        startDistance + (endDistance - startDistance) * easedProgress;

      // Position camera using spherical coordinates
      this.updateCameraPosition(distance);

      if (progress >= 1) {
        this.zoomOutAnimation.active = false;
      }
    } else {
      // Normal camera positioning when zoom animation is complete
      const distance = this.camera.position.length();
      this.updateCameraPosition(distance);
    }
  }

  updateCameraPosition(distance) {
    this.camera.position.x =
      distance * Math.cos(this.rotationY) * Math.cos(this.rotationX);
    this.camera.position.y = distance * Math.sin(this.rotationX);
    this.camera.position.z =
      distance * Math.sin(this.rotationY) * Math.cos(this.rotationX);
    this.camera.lookAt(0, 0, 0);
  }

  updateObjectRotations() {
    const rotationSpeed = 0.002;

    this.torusWireframe.rotation.x += rotationSpeed;
    this.torusWireframe.rotation.y += rotationSpeed;
    this.torusWireframe.rotation.z += rotationSpeed;

    if (this.cellGroup) {
      this.cellGroup.rotation.x += rotationSpeed;
      this.cellGroup.rotation.y += rotationSpeed;
      this.cellGroup.rotation.z += rotationSpeed;
    }

    if (this.gridGroup) {
      this.gridGroup.rotation.x += rotationSpeed;
      this.gridGroup.rotation.y += rotationSpeed;
      this.gridGroup.rotation.z += rotationSpeed;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
