const THREE = require('three');
import { bl, _l_pause,_l_resume } from './GlobalData.js'
import { hl } from './ConstantDefinition.js'
import { Al,Nl } from './Tool3d.js'

/**
 * 交互接口
 */
export default class MouseEvent {
    constructor(t) {
        this.props = t,
        this.handleMouseDown = this.handleMouseDown.bind(this),
        this.handleMouseMove = this.handleMouseMove.bind(this),
        this.handleMouseUp = this.handleMouseUp.bind(this),
        this.handleMouseOut = this.handleMouseOut.bind(this),
        this.handleTouchStart = this.handleTouchStart.bind(this),
        this.handleTouchMove = this.handleTouchMove.bind(this),
        this.handleTouchEnd = this.handleTouchEnd.bind(this),
        this.handlePause = this.handlePause.bind(this),
        this.handleResume = this.handleResume.bind(this),
        this.init()
    }
    init() {
        this.dragging = !1,
        this.mouse = new THREE.Vector2(.5,.5),
        this.lastMouse = new THREE.Vector2(.5,.5),
        this.target = new THREE.Vector3(0,0),
        this.matrix = new THREE.Matrix4(),
        this.velocity = new THREE.Vector2(),
        this.autoRotationSpeedScalar = 1,
        this.autoRotationSpeedScalarTarget = 1,
        this.addListeners(),
        _l_pause.add(this.handlePause),
        _l_resume.add(this.handleResume)
    }
    addListeners() {
        const {domElement: t} = this.props;
        this.removeListeners(),
        t.addEventListener("mousedown", this.handleMouseDown, !1),
        t.addEventListener("mousemove", this.handleMouseMove, !1),
        t.addEventListener("mouseup", this.handleMouseUp, !1),
        t.addEventListener("mouseout", this.handleMouseOut, !1),
        t.addEventListener("mouseleave", this.handleMouseOut, !1),
        t.addEventListener("touchstart", this.handleTouchStart, !1),
        t.addEventListener("touchmove", this.handleTouchMove, !1),
        t.addEventListener("touchend", this.handleTouchEnd, !1),
        t.addEventListener("touchcancel", this.handleTouchEnd, !1)
    }
    removeListeners() {
        const {domElement: t} = this.props;
        t.removeEventListener("mousedown", this.handleMouseDown),
        t.removeEventListener("mousemove", this.handleMouseMove),
        t.removeEventListener("mouseup", this.handleMouseUp),
        t.removeEventListener("mouseout", this.handleMouseOut),
        t.removeEventListener("mouseleave", this.handleMouseOut),
        t.removeEventListener("touchstart", this.handleTouchStart),
        t.removeEventListener("touchmove", this.handleTouchMove),
        t.removeEventListener("touchend", this.handleTouchEnd),
        t.removeEventListener("touchcancel", this.handleTouchEnd)
    }
    setMouse(t) {
        const {width: e, height: n} = bl.parentNode.getBoundingClientRect();
        this.mouse.x = t.clientX / e * 2 - 1,
        this.mouse.y = -t.clientY / n * 2 + 1
    }
    setDragging(t) {
        this.dragging = t;
        const {setDraggingCallback: e} = this.props;
        e && "function" == typeof e && e(t)
    }
    handlePause() {
      this.removeListeners()
      // console.error("handlePause");

    }
    handleResume() {
      this.addListeners()
      // console.error("handleResume");
    }
    handleMouseDown(t) {
        this.setMouse(t),
        this.setDragging(!0)
    }
    handleMouseMove(t) {
        this.setMouse(t)
    }
    handleMouseUp(t) {
        this.setMouse(t),
        this.setDragging(!1)
    }
    handleMouseOut() {
        this.setDragging(!1)
    }
    handleTouchStart(t) {
        this.setMouse(t.changedTouches[0]),
        this.lastMouse.copy(this.mouse),
        this.setDragging(!0)
    }
    handleTouchMove(t) {
        this.setMouse(t.changedTouches[0])
    }
    handleTouchEnd(t) {
        this.setMouse(t.changedTouches[0]),
        this.setDragging(!1)
    }
    update(t=.01) {
        let e = 0
          , n = 0;
        const {object: i, objectContainer: r, rotateSpeed: s, autoRotationSpeed: o, easing: c=.1, maxRotationX: h=.3} = this.props;
        this.dragging && (e = this.mouse.x - this.lastMouse.x,
        n = this.mouse.y - this.lastMouse.y,
        this.target.y = Nl(this.target.y - n, -h, .6 * h)),
        r.rotation.x += (this.target.y + hl.x - r.rotation.x) * c,
        this.target.x += (e - this.target.x) * c,
        Al(i, this.target.x * s, this.matrix),
        this.dragging || Al(i, t * o * this.autoRotationSpeedScalar, this.matrix),
        this.autoRotationSpeedScalar += .05 * (this.autoRotationSpeedScalarTarget - this.autoRotationSpeedScalar),
        this.lastMouse.copy(this.mouse),
        this.velocity.set(e, n)
    }
    dispose() {
        this.removeListeners(),
        _l_pause.remove(this.handlePause),
        _l_resume.remove(this.handleResume),
        this.dragging = null,
        this.mouse = null,
        this.lastMouse = null,
        this.target = null,
        this.matrix = null,
        this.velocity = null,
        this.autoRotationSpeedScalar = null,
        this.autoRotationSpeedScalarTarget = null
    }
}
