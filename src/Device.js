const THREE = require('three')
import { bl, _l_pause, _l_resume } from './GlobalData.js'
import Stage from './Stage.js'
import particleDiffuse  from '../assets/particle-diffuse.png'
import worldMap  from '../assets/map.png'

export default class Device {
  constructor(t) {
    for (let i in t) {
      bl[i] = t[i]
    }
      this.init = this.init.bind(this),
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this),

      function(t) {
          for (const [e,n] of Object.entries(t))
              bl[e] = n
      }({
          app: this,
          env: "production",
          imagePath: "images/",
          isMobile: /iPhone|iPad|iPod|Android|BlackBerry|BB10/i.test(navigator.userAgent),
          pixelRatio: window.devicePixelRatio || 1,
      })
    }
    loadAssets() {
        const {textureSrc} = bl
        const worldMaploader = new THREE.TextureLoader()
        const particleloader = new THREE.TextureLoader()

        return Promise.all([new Promise((res)=>{
          particleloader.load(particleDiffuse,(texture)=>{
            res(texture)
          })
        }),new Promise((res)=>{
          worldMaploader.load(textureSrc || worldMap,(texture)=>{
            res(texture)
          })
        })]).then(([particleDiffuse,worldMap])=>{
          return {textures:{particleDiffuse,worldMap}}
        })
    }
    trackPageVisibility() {
        let t, e;
        void 0 !== document.hidden ? (t = "hidden",
        e = "visibilitychange") : void 0 !== document.msHidden ? (t = "msHidden",
        e = "msvisibilitychange") : void 0 !== document.webkitHidden && (t = "webkitHidden",
        e = "webkitvisibilitychange"),
        this.documentHidden = t,
        this.visibilityChange = e,
        document.addEventListener(e, this.handleVisibilityChange, !1)
    }
    init() {
        return new Promise(((t,e)=>{
            this.loadAssets().then((n=>{
                bl.assets = n;
                const {parentNode: i=document.body} = bl
                this.webglController = new Stage(i),
                this.webglController.initDataObjects([]),
                this.trackPageVisibility(),
                t()
            }
            )).catch((t=>{
                e(t)
            }
            ))
        }
        ))
    }
    handleVisibilityChange() {
        document[this.documentHidden] ? _l_pause.dispatch() : _l_resume.dispatch()
    }
    get renderer() {
        return this.webglController ? this.webglController.renderer : null
    }
    get canvas() {
        return this.webglController ? this.webglController.renderer.domElement : null
    }
    dispose() {
        document.removeEventListener(this.visibilityChange, this.handleVisibilityChange),
        this.webglController.dispose(),
        this.webglController = null,
        this.visibilityChange = null,
        this.documentHidden = null,
        Object.keys(bl).forEach((t=>{
            delete bl[t]
        }
        ))
    }
}
