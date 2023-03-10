import * as PIXI from 'pixi.js'

function createRenderer(w, h) {
  hackPIXIToForceNewBlendModes()

  // For now, we are using CanvasRenderer instead of WebGLRenderer or
  // autoDetectRenderer befcause of two reasons.
  // 1. Current implementation has some problem with rendering
  //    sprite batches: https://github.com/pixijs/pixi.js/issues/1910
  // 2. It seems that Canvas performs better on some browsers, i.e. Chrome.
  //    WebGLRenderer only performs better on Firefox from the experiment.
  return new PIXI.CanvasRenderer(w, h, { transparent: true })
}

// HACK: Sometimes, when using the canvas renderer,
// the blend mode is not properly set.
function hackPIXIToForceNewBlendModes() {
  PIXI.utils.canUseNewCanvasBlendModes = () => true
}

export class Context {
  constructor(skin, { touchEventTarget } = {}) {
    this.refs = {}
    this._skin = skin
    this._touchEventTarget = touchEventTarget
    this._instance = skin.instantiate(this)
    this._renderer = createRenderer(skin.width, skin.height)
    this.stage = this._instance.object
    this.view = this._renderer.view
    this.skinData = skin.data
    this._setupInteractivity()
  }

  render(data) {
    this._instance.push(data)
    this._renderer.render(this.stage)
  }

  destroy() {
    this._instance.destroy()
    this._instance = null
    this._teardownInteractivity()
  }

  get input() {
    return this._input.get()
  }

  ref(key, object) {
    const set = this.refs[key] || (this.refs[key] = new Set())
    set.add(object)
  }

  unref(key, object) {
    const set = this.refs[key]
    if (!set) return
    set.delete(object)
  }

  _setupInteractivity() {
    let mouse = null
    let touches = []
    const onMouse = (e) => {
      mouse = e
    }
    const onUpdateMouse = (e) => {
      mouse = mouse && e
    }
    const onNoMouse = () => {
      mouse = null
    }
    const onTouch = (e) => {
      touches = [].slice.call(e.touches)
    }
    const touchTarget = this._touchEventTarget || this.view
    const width = this._skin.width
    const height = this._skin.height
    touchTarget.addEventListener('mousedown', onMouse, false)
    touchTarget.addEventListener('mousemove', onUpdateMouse, false)
    touchTarget.addEventListener('mouseup', onNoMouse, false)
    touchTarget.addEventListener('touchstart', onTouch, false)
    touchTarget.addEventListener('touchmove', onTouch, false)
    touchTarget.addEventListener('touchend', onTouch, false)
    this._teardownInteractivity = () => {
      touchTarget.removeEventListener('mousedown', onMouse, false)
      touchTarget.removeEventListener('mousemove', onUpdateMouse, false)
      touchTarget.removeEventListener('mouseup', onNoMouse, false)
      touchTarget.removeEventListener('touchstart', onTouch, false)
      touchTarget.removeEventListener('touchmove', onTouch, false)
      touchTarget.removeEventListener('touchend', onTouch, false)
    }
    this._input = {
      get: () => {
        const output = []
        const rect = this.view.getBoundingClientRect()
        if (mouse) {
          output.push(point('mouse', mouse, rect))
        }
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i]
          output.push(point('touch' + touch.identifier, touch, rect))
        }
        return output
      },
    }
    function point(id, p, rect) {
      return {
        x: ((p.clientX - rect.left) / rect.width) * width,
        y: ((p.clientY - rect.top) / rect.height) * height,
        id: id,
      }
    }
  }
}

export default Context
