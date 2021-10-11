import {bl, _l_pause, _l_resume} from './GlobalData.js'
import {hl, fl, ml, gl, Ml, ul, dl, pl, vl, yl} from './ConstantDefinition.js'
import {Ll} from './Tool3d.js'
import Earth from './Earth.js'
import MouseEvent from './MouseEvent.js'
import {Rl} from './Tool3d.js'
import THREE from 'three'


export default class Stage {
  constructor(t) {
    this.handleResize = this.handleResize.bind(this),
      this.handlePause = this.handlePause.bind(this),
      this.handleResume = this.handleResume.bind(this),
      this.handleScroll = this.handleScroll.bind(this),
      this.handleMouseMove = this.handleMouseMove.bind(this),
      this.setDragging = this.setDragging.bind(this),
      this.update = this.update.bind(this),
      this.hasLoaded = !1,
      this.initBase(t || document.body),
      this.initScene(),
      this.addListeners(),
      _l_pause.add(this.handlePause),
      _l_resume.add(this.handleResume)
  }

  initBase(t) {
    const {width: e, height: n} = bl.parentNode.getBoundingClientRect();
    const {backgroundColor=265505,backgroundOpacity=1} = bl
    this.scene = new THREE.Scene(),
      this.camera = new THREE.PerspectiveCamera(20, e / n, 170, 260),
      this.renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        alpha: true,
        preserveDrawingBuffer: !1
      }),
      this.then = Date.now() / 1e3,
      this.fpsWarnings = 0,
      this.fpsWarningThreshold = 50,
      this.fpsTarget = 60,
      this.fpsEmergencyThreshold = 12,
      this.fpsTargetSensitivity = .925,
      this.fpsStorage = [],
      this.worldDotRows = 200,
      this.worldDotSize = .095,
      this.renderQuality = 4,
      this.renderer.setPixelRatio(bl.pixelRatio || 1),
      this.renderer.setSize(e, n),
      // this.renderer.setClearColor(16448250, 1),
      this.renderer.setClearColor(backgroundColor, backgroundOpacity),
      t.appendChild(this.renderer.domElement),
      this.renderer.domElement.classList.add("webgl-canvas"),
      this.renderer.domElement.classList.add("js-globe-canvas");
    const i = new THREE.AmbientLight(16777215, .8);
    this.scene.add(i),
      this.parentContainer = new THREE.Group(),
      this.parentContainer.name = "parentContainer";
    let r = hl;
    const s = (new Date).getTimezoneOffset() || 0;
    r.y = hl.y + Math.PI * (s / 720),
      this.parentContainer.rotation.copy(r),
      this.scene.add(this.parentContainer),
      this.haloContainer = new THREE.Group(),
      this.haloContainer.name = "haloContainer",
      this.scene.add(this.haloContainer),
      this.container = new THREE.Group(),
      this.container.name = "container",
      this.parentContainer.add(this.container),
      this.camera.position.set(0, 0, 220),
      this.scene.add(this.camera),
      this.clock = new THREE.Clock(),
      this.mouse = new THREE.Vector3(0, 0, .5),
      this.mouseScreenPos = new THREE.Vector2(-9999, -9999),
      this.raycaster = new THREE.Raycaster(),
      this.raycaster.far = 260,
      this.paused = !1,
      this.canvasOffset = {
        x: 0,
        y: 0
      },
      this.updateCanvasOffset(),
      this.highlightMaterial = new THREE.MeshBasicMaterial({
        opacity: 1,
        transparent: !1,
        color: fl
      }),
      this.handleResize(),
      this.startUpdating()
    window.scene = this.scene
  }

  initScene() {
    const {isMobile: t, globeRadius: e=25, autoRotationSpeed, draggingRotationSpeed} = bl;
    // console.log(bl)
    this.radius = e,
      this.light0 = new THREE.SpotLight(ml, 12, 120, .3, 0, 1.1),
      this.light1 = new THREE.DirectionalLight(11124735, 3),
      this.light3 = new THREE.SpotLight(gl, 5, 75, .5, 0, 1.25),
      this.light0.target = this.parentContainer,
      this.light1.target = this.parentContainer,
      this.light3.target = this.parentContainer,
      this.scene.add(this.light0, this.light1, this.light3),
      this.positionContainer(),
      this.shadowPoint = (new THREE.Vector3).copy(this.parentContainer.position).add(new THREE.Vector3(.7 * this.radius, .3 * -this.radius, this.radius)),
      this.highlightPoint = (new THREE.Vector3).copy(this.parentContainer.position).add(new THREE.Vector3(1.5 * -this.radius, 1.5 * -this.radius, 0)),
      this.frontPoint = (new THREE.Vector3).copy(this.parentContainer.position).add(new THREE.Vector3(0, 0, this.radius));
    const r = new Earth({
      radius: this.radius,
      detail: 55,
      renderer: this.renderer,
      shadowPoint: this.shadowPoint,
      shadowDist: 1.5 * this.radius,
      highlightPoint: this.highlightPoint,
      // 地球内边缘一圈高光颜色
      highlightColor: 5339494,
      highlightDist: 5,
      frontPoint: this.frontPoint,
      // 地球前面高光颜色
      frontHighlightColor: 2569853,
      // 地球水的颜色
      waterColor: 1513012,
      landColorFront:  fl,
      landColorBack: fl
    });
    this.container.add(r.mesh),
      this.globe = r;

    // 发光光源
    const s = new THREE.Mesh(new THREE.SphereBufferGeometry(e, 45, 45), new THREE.ShaderMaterial({
      uniforms: {
        c: {
          type: "f",
          value: .7
        },
        p: {
          type: "f",
          value: 15
        },
        glowColor: {
          type: "c",
          value: new THREE.Color(0x1c2462)
        },
        viewVector: {
          type: "v3",
          value: new THREE.Vector3(0, 0, 220)
        }
      },
      vertexShader: `
            #define GLSLIFY 1
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;
            void main()
            {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( c - dot(vNormal, vNormel), p );

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
      fragmentShader: `
            #define GLSLIFY 1
            uniform vec3 glowColor;
            varying float intensity;
            void main()
            {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }`,
      side: 1,
      blending: 2,
      transparent: !0
    }));
    s.name = "GlowLight"
    s.scale.multiplyScalar(1.15),
      s.rotateX(.03 * Math.PI),
      s.rotateY(.03 * Math.PI),
      s.renderOrder = 3,
      this.haloContainer.add(s)


    this.dragging = !1,
      this.rotationSpeed = autoRotationSpeed || .15,
      this.raycastIndex = 0,
      this.raycastTrigger = 10,
      this.raycastTargets = [],
      this.intersectTests = [],
      this.controls = new MouseEvent({
        object: this.container,
        objectContainer: this.parentContainer,
        domElement: this.renderer.domElement,
        setDraggingCallback: this.setDragging,
        rotateSpeed: t ? (draggingRotationSpeed && draggingRotationSpeed / 2) || 1.5 : draggingRotationSpeed || 3,
        autoRotationSpeed: this.rotationSpeed,
        easing: .12,
        maxRotationX: .5,
        camera: this.camera
      })
  }

  initDataObjects(t) {
    const e = {
      openPrColor: ml,
      openPrParticleColor: 6137337,
      mergedPrColor: gl,
      mergedPrColorHighlight: fl
    }
      , {assets: {textures: {particleDiffuse: i, worldMap: r}}} = bl;
    this.buildWorldGeometry(),
      this.addArcticCodeVault(),
      this.maxAmount = t.length,
      this.maxIndexDistance = 60,
      this.indexIncrementSpeed = 15,
      this.visibleIndex = 60;

    const {width: s, height: o} = bl.parentNode.getBoundingClientRect()
      , c = 850 / o * 1;
    this.containerScale = c,

      this.dataItem = {},
      this.intersectTests.push(this.globe.meshFill),
      this.intersects = []
  }

  monitorFps() {
    if (1 == this.renderQuality)
      return;
    const t = Date.now() / 1e3
      , e = t - this.then;
    this.then = t;
    const n = parseInt(1 / e + .5);
    this.fpsStorage.push(n),
    this.fpsStorage.length > 10 && this.fpsStorage.shift();
    const i = this.fpsStorage.reduce(((t, e) => t + e)) / this.fpsStorage.length;
    i < this.fpsTarget * this.fpsTargetSensitivity && this.fpsStorage.length > 9 ? (this.fpsWarnings++,
    this.fpsWarnings > this.fpsWarningThreshold && (this.renderQuality = Math.max(this.renderQuality - 1, 1),
      this.fpsWarnings = 0,
      this.updateRenderQuality(),
      this.fpsStorage = [])) : this.fpsStorage.length > 9 && i < this.fpsEmergencyThreshold ? (this.renderQuality = 1,
      this.initPerformanceEmergency()) : this.fpsWarnings = 0
  }

  updateRenderQuality() {
    4 == this.renderQuality ? this.initRegularQuality() : 3 == this.renderQuality ? this.initMediumQuality() : 2 == this.renderQuality ? this.initLowQuality() : 1 == this.renderQuality && this.initLowestQuality()
  }

  initRegularQuality() {
    this.renderer.setPixelRatio(bl.pixelRatio || 1),
      this.indexIncrementSpeed = 15,
      this.raycastTrigger = 10
  }

  initMediumQuality() {
    this.renderer.setPixelRatio(Math.min(bl.pixelRatio, 1.85)),
      this.indexIncrementSpeed = 13,
      this.raycastTrigger = 12
  }

  initLowQuality() {
    this.renderer.setPixelRatio(Math.min(bl.pixelRatio, 1.5)),
      this.indexIncrementSpeed = 10,
      this.raycastTrigger = 14,
      this.worldDotRows = 180,
      this.worldDotSize = .1,
      this.resetWorldMap(),
      this.buildWorldGeometry()
  }

  initLowestQuality() {
    this.renderer.setPixelRatio(1),
      this.indexIncrementSpeed = 5,
      this.raycastTrigger = 16,
      this.worldDotRows = 140,
      this.worldDotSize = .1,
      this.resetWorldMap(),
      this.buildWorldGeometry()
  }

  initPerformanceEmergency() {
    this.dispose(),
      Ol()
  }

  buildWorldGeometry() {
    const {assets: {textures: {worldMap: t}}, dotColor} = bl
      , e = new THREE.Light()
      , n = this.getImageData(t.image)
      , i = []
      , r = this.worldDotRows;
    for (let h = -90; h <= 90; h += 180 / r) {
      const t = Math.cos(Math.abs(h) * Ml) * this.radius * Math.PI * 2 * 2;
      for (let r = 0; r < t; r++) {
        const s = 360 * r / t - 180;
        if (!this.visibilityForCoordinate(s, h, n))
          continue;
        const o = Rl(h, s, this.radius);
        e.position.set(o.x, o.y, o.z);
        const c = Rl(h, s, this.radius + 5);
        e.lookAt(c.x, c.y, c.z),
          e.updateMatrix(),
          i.push(e.matrix.clone())
      }
    }
    const s = new THREE.CircleBufferGeometry(this.worldDotSize, 5)
      , o = new THREE.MeshStandardMaterial({
      color: dotColor || 3818644, //#3a4494
      metalness: 0,
      roughness: .9,
      // transparent: !0,
      side: THREE.DoubleSide,
      alphaTest: .02
    });
    o.onBeforeCompile = function (t) {
      t.fragmentShader = t.fragmentShader.replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );", "\n        gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n        if (gl_FragCoord.z > 0.51) {\n          gl_FragColor.a = 1.0 + ( 0.51 - gl_FragCoord.z ) * 17.0;\n        }\n      ")
    }
    ;
    const c = new THREE.InstancedMesh(s, o, i.length);
    for (let h = 0; h < i.length; h++)
      c.setMatrixAt(h, i[h]);
    c.renderOrder = 3,
      this.worldMesh = c,
      c.name = "points"
    this.container.add(c)
  }

  resetWorldMap() {
    this.container.remove(this.worldMesh),
      Ll(this.worldMesh),
      this.dotMesh = null
  }

  addArcticCodeVault() {
    const {flagLat = 39.56, flagLon = 116.20, flagScale = 1,flagColor = 4299263} = bl
    new THREE.CylinderBufferGeometry(.075, .075, 1.5, 8),
      this.vaultMaterial = new THREE.MeshBasicMaterial({
        blending: 2,
        opacity: .9,
        transparent: !0,
        color: flagColor
      }),
      this.vaultIsHighlighted = !1;
    const t = Rl(flagLat, flagLon, this.radius)
    const e = Rl(flagLat, flagLon, this.radius + 5)
    // const {basePath: n, imagePath: i} = bl
    // const r = `${n}${i}flag.obj`;
    const r = require('../assets/flag.json')
    const loader = new THREE.ObjectLoader()
    const n = loader.parse(r)
    n.position.set(t.x, t.y, t.z),
      n.lookAt(e.x, e.y, e.z),
      n.rotateX(90 * Ml),
      n.scale.set(flagScale * .1,flagScale * .1,flagScale * .1),
      n.renderOrder = 3;
    for (const t of n.children)
      t.material = this.vaultMaterial,
        t.name = "arcticCodeVault",
        this.arcticCodeVaultMesh = t,
        this.intersectTests.push(this.arcticCodeVaultMesh);
    this.container.add(n)

    // (new THREE.OBJLoader()).load(r, (n => {
    //     console.log(JSON.stringify(n.toJSON()))
    //     n.position.set(t.x, t.y, t.z),
    //       n.lookAt(e.x, e.y, e.z),
    //       n.rotateX(90 * Ml),
    //       n.scale.set(.1, .1, .1),
    //       n.renderOrder = 3;
    //     for (const t of n.children)
    //       t.material = this.vaultMaterial,
    //         t.name = "arcticCodeVault",
    //         this.arcticCodeVaultMesh = t,
    //         this.intersectTests.push(this.arcticCodeVaultMesh);
    //     this.container.add(n)
    //   }
    // ))
  }

  highlightArcticCodeVault() {
    this.vaultIsHighlighted || (this.arcticCodeVaultMesh.material = this.highlightMaterial,
      this.vaultIsHighlighted = !0)
  }

  resetArcticCodeVaultHighlight() {
    this.vaultIsHighlighted && (this.arcticCodeVaultMesh.material = this.vaultMaterial,
      this.vaultIsHighlighted = !1)
  }

  visibilityForCoordinate(t, e, n) {
    const i = 4 * n.width
      , r = parseInt((t + 180) / 360 * n.width + .5)
      , s = n.height - parseInt((e + 90) / 180 * n.height - .5)
      , o = parseInt(i * (s - 1) + 4 * r) + 3;
    return n.data[o] > 90
  }

  getImageData(t) {
    const e = document.createElement("canvas").getContext("2d");
    return e.canvas.width = t.width,
      e.canvas.height = t.height,
      e.drawImage(t, 0, 0, t.width, t.height),
      e.getImageData(0, 0, t.width, t.height)
  }

  addListeners() {
    window.addEventListener("resize", this.handleResize, !1),
      window.addEventListener("orientationchange", this.handleResize, !1),
      window.addEventListener("scroll", this.handleScroll, !1),
      // this.handleClick = t=>{
      //     null === this.dataItem || null === this.dataItem.url || this.shouldCancelClick(t) || window.open(this.dataItem.url, "_blank")
      // }
      //,
      // this.renderer.domElement.addEventListener("mouseup", this.handleClick, !1),
      this.handleMouseDown = t => {
        this.resetInteractionIntention(t)
      }
      ,
      this.renderer.domElement.addEventListener("mousedown", this.handleMouseDown, !1),
      this.handleTouchStart = t => {
        const e = t.changedTouches[0];
        this.handleMouseMove(e),
          this.resetInteractionIntention(e),
          t.preventDefault()
      }
      ,
      this.renderer.domElement.addEventListener("touchstart", this.handleTouchStart, !1),
      this.handleTouchMove = t => {
        this.shouldCancelClick(t.changedTouches[0]) && (this.mouse = {
          x: -9999,
          y: -9999
        },
          t.preventDefault())
      }
      ,
      this.renderer.domElement.addEventListener("touchmove", this.handleTouchMove, !1),
      this.renderer.domElement.addEventListener("mousemove", this.handleMouseMove, !1)
  }

  removeListeners() {
    window.removeEventListener("resize", this.handleResize),
      window.removeEventListener("orientationchange", this.handleResize),
      window.removeEventListener("scroll", this.handleScroll),
      this.renderer.domElement.removeEventListener("mousemove", this.handleMouseMove),
      this.renderer.domElement.removeEventListener("mouseup", this.handleClick),
      this.renderer.domElement.removeEventListener("mousedown", this.handleMouseDown),
      this.renderer.domElement.removeEventListener("touchstart", this.handleTouchStart),
      this.renderer.domElement.removeEventListener("touchmove", this.handleTouchMove)
  }

  updateCanvasOffset() {
    const t = document.querySelector(".js-webgl-globe-wrap").getBoundingClientRect()
      , e = document.querySelector(".js-webgl-globe").getBoundingClientRect();
    this.canvasOffset = {
      x: e.x - t.x,
      y: e.y - t.y
    }
  }

  resetInteractionIntention(t) {
    this.mouseDownPos = {
      x: t.clientX,
      y: t.clientY
    }
  }

  shouldCancelClick(t) {
    const e = Math.abs(t.clientX - this.mouseDownPos.x);
    return Math.abs(t.clientY - this.mouseDownPos.y) > 2 || e > 2
  }

  positionContainer() {
    const {isMobile: t, parentNode: e} = bl
      , {height: n} = e.getBoundingClientRect()
      , i = 850 / n * 1;
    this.containerScale = i,
      t ? this.parentContainer.position.set(0, 0, 0) : (this.parentContainer.scale.set(i, i, i),
        this.parentContainer.position.set(0, 0, 0),
        this.haloContainer.scale.set(i, i, i)),
      this.haloContainer.position.set(0, 0, -10),
      this.positionLights(i)
  }

  positionLights(t = 1) {
    this.light0 && (this.light0.position.set(this.parentContainer.position.x - 2.5 * this.radius, 80, -40).multiplyScalar(t),
      this.light0.distance = 120 * t),
    this.light1 && this.light1.position.set(this.parentContainer.position.x - 50, this.parentContainer.position.y + 30, 10).multiplyScalar(t),
    this.light2 && (this.light2.position.set(this.parentContainer.position.x - 25, 0, 100).multiplyScalar(t),
      this.light2.distance = 150 * t),
    this.light3 && (this.light3.position.set(this.parentContainer.position.x + this.radius, this.radius, 2 * this.radius).multiplyScalar(t),
      this.light3.distance = 75 * t)
  }

  handlePause() {
    this.stopUpdating(),
      this.clock.stop()
  }

  handleResume() {
    this.clock.start(),
      this.startUpdating()
  }

  handleScroll() {
    window.scrollY >= this.renderer.domElement.getBoundingClientRect().height && !this.paused ? (this.paused = !0,
      _l_pause.dispatch(vl)) : window.scrollY < this.renderer.domElement.getBoundingClientRect().height && this.paused && (this.paused = !1,
      _l_resume.dispatch(yl))
  }

  handleResize() {
    clearTimeout(this.resizeTimeout),
      this.resizeTimeout = setTimeout((() => {
          const {width: t, height: e} = bl.parentNode.getBoundingClientRect();
          this.camera.aspect = t / e,
            this.camera.updateProjectionMatrix(),
            this.renderer.setSize(t, e),
            this.positionContainer();
          const n = 850 / e * 1
            , i = this.radius * n;
          this.shadowPoint.copy(this.parentContainer.position).add(new THREE.Vector3(.7 * i, .3 * -i, i)),
            this.globe.setShadowPoint(this.shadowPoint),
            this.highlightPoint.copy(this.parentContainer.position).add(new THREE.Vector3(1.5 * -i, 1.5 * -i, 0)),
            this.globe.setHighlightPoint(this.highlightPoint),
            this.frontPoint = (new THREE.Vector3).copy(this.parentContainer.position).add(new THREE.Vector3(0, 0, i)),
            this.globe.setFrontPoint(this.frontPoint),
            this.globe.setShadowDist(1.5 * i),
            this.globe.setHighlightDist(5 * n),
            this.updateCanvasOffset()
        }
      ), 150)
  }

  handleMouseMove(t) {
    null != t.preventDefault && t.preventDefault();
    const {width: e, height: n, x: i, y: r} = bl.parentNode.getBoundingClientRect()
      , s = t.clientX - i
      , o = t.clientY - r;
    this.mouse.x = s / e * 2 - 1,
      this.mouse.y = -o / n * 2 + 1,
      this.mouseScreenPos.set(s, o)
  }

  startUpdating() {
    this.stopUpdating(),
      this.update()
  }

  stopUpdating() {
    cancelAnimationFrame(this.rafID)
  }

  setDragging(t = !0) {
    this.dragging = t
  }

  setDataInfo(t) {
    return
  }

  testForDataIntersection() {
    const {mouse: t, raycaster: e, camera: n} = this;
    this.intersects.length = 0,
      function (t, e, n, i, r, s = !1) {
        (i = i || new THREE.Raycaster()).setFromCamera(t, e);
        const o = i.intersectObjects(n, s, r);
        o.length > 0 && o[0]
      }(t, n, this.intersectTests, e, this.intersects),
    this.intersects.length && this.intersects[0].object === this.globe.meshFill && (this.intersects.length = 0)
  }

  transitionIn() {
    return new Promise((() => {
        // this.container.add(this.openPrEntity.mesh),
        this.container.add(this.mergedPrEntity.mesh)
      }
    ))
  }

  handleUpdate() {
    if (this.monitorFps(),
    null === this.clock)
      return;
    const t = this.clock.getDelta();
    this.controls && this.controls.update(t),
      this.visibleIndex += t * this.indexIncrementSpeed,
    this.visibleIndex >= this.maxAmount - 60 && (this.visibleIndex = 60)
    return void this.render();
  }

  update() {
    this.handleUpdate(),
    this.hasLoaded || this.sceneDidLoad(),
      this.rafID = requestAnimationFrame(this.update)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  shouldShowMergedPrEntity(t, e) {
    const n = t.geometry.attributes.index.array[e];
    return n >= this.visibleIndex - this.maxIndexDistance && n <= this.visibleIndex + this.maxIndexDistance
  }

  sceneDidLoad() {
    this.hasLoaded = !0;
  }

  setMergedPrEntityDataItem(t) {
    // this.mergedPrEntity.setHighlightObject(t),
    // this.openPrEntity.setHighlightIndex(-9999);
    // const e = this.mergedPrEntity.props.data[parseInt(t.userData.dataIndex)];
    return e.type = dl,
      e
  }

  shouldShowOpenPrEntity(t) {
    return t >= this.visibleIndex - this.maxIndexDistance && t <= this.visibleIndex + this.maxIndexDistance
  }

  setOpenPrEntityDataItem(t) {
    // this.openPrEntity.setHighlightIndex(t);
    // this.mergedPrEntity.resetHighlight();
    const e = this.openPrEntity.props.data[t];
    return e.type = ul,
      e
  }

  dispose() {
    this.stopUpdating(),
      this.removeListeners(),
      _l_pause.removeAll(vl, this.handlePause),
      _l_resume.removeAll(yl, this.handleResume),
    this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode && this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),
    this.controls && this.controls.dispose(),
    this.globe && this.globe.dispose(),
      // this.openPrEntity && this.openPrEntity.dispose(),
      // this.mergedPrEntity && this.mergedPrEntity.dispose(),
    this.dataInfo && this.dataInfo.dispose(),
      this.scene = null,
      this.camera = null,
      this.renderer = null,
      this.parentContainer = null,
      this.container = null,
      this.clock = null,
      this.mouse = null,
      this.mouseScreenPos = null,
      this.raycaster = null,
      this.paused = null,
      this.radius = null,
      this.light0 = null,
      this.light1 = null,
      this.light2 = null,
      this.light3 = null,
      this.shadowPoint = null,
      this.highlightPoint = null,
      this.frontPoint = null,
      this.globe = null,
      this.dragging = null,
      this.rotationSpeed = null,
      this.raycastIndex = null,
      this.raycastTrigger = null,
      this.raycastTargets = null,
      this.intersectTests = null,
      this.controls = null,
      this.maxAmount = null,
      this.maxIndexDistance = null,
      this.indexIncrementSpeed = null,
      this.visibleIndex = null
    // this.openPrEntity = null
  }
}
