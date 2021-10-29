import THREE from 'three'
import { Ml,Sl } from './ConstantDefinition.js'


function El(t) {
    return t * Ml
}
function Tl(t) {
    return t * Sl
}

export function Rl(t, e, n, i) {
    i = i || new THREE.Vector3;
    const r = (90 - t) * Ml
      , s = (e + 180) * Ml;
    return i.set(-n * Math.sin(r) * Math.cos(s), n * Math.cos(r), n * Math.sin(r) * Math.sin(s)),
    i
}


export function Dl(t, e, n, i, r) {
    return function(t, e, n) {
        return (n - e) * t + e
    }(function(t, e, n) {
        return (t - e) / (n - e) || 0
    }(t, e, n), i, r)
}

export function Nl(t, e, n) {
    return Math.max(e, Math.min(t, n))
}


export function Cl(t, e, n, i) {
    t = El(t),
    e = El(e),
    n = El(n);
    const r = (i = El(i)) - e
      , s = Math.cos(n) * Math.cos(r)
      , o = Math.cos(n) * Math.sin(r)
      , c = Math.atan2(Math.sin(t) + Math.sin(n), Math.sqrt((Math.cos(t) + s) * (Math.cos(t) + s) + o * o))
      , h = e + Math.atan2(o, Math.cos(t) + s);
    return [Tl(c), Tl(h)]
}

export function Al(t, e, n) {
    const i = n || new THREE.Matrix4();
    i.identity(),
    i.makeRotationY(e),
    i.multiply(t.matrix),
    t.matrix.copy(i),
    t.rotation.setFromRotationMatrix(t.matrix)
}

export function Ll(t) {
    t instanceof THREE.Mesh && (t.geometry && t.geometry.dispose(),
    t.material && (t.material.map && t.material.map.dispose(),
    t.material.lightMap && t.material.lightMap.dispose(),
    t.material.bumpMap && t.material.bumpMap.dispose(),
    t.material.normalMap && t.material.normalMap.dispose(),
    t.material.specularMap && t.material.specularMap.dispose(),
    t.material.envMap && t.material.envMap.dispose(),
    t.material.emissiveMap && t.material.emissiveMap.dispose(),
    t.material.metalnessMap && t.material.metalnessMap.dispose(),
    t.material.roughnessMap && t.material.roughnessMap.dispose(),
    t.material.dispose()))
}

export function Pl(t, e) {
    for (let n = t.children.length - 1; n >= 0; n--) {
        const i = t.children[n];
        Pl(i, e),
        "function" == typeof e && e(i)
    }
}
