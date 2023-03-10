import * as PIXI from 'pixi.js'

import Expression from '../expression'
import Instance from './lib/instance'
import SkinNode from './lib/base'

function ChildManager(expr, child, poolSize) {
  return {
    instantiate(context, subject) {
      const instances = new Map()
      const pool = []
      initPool()
      return new Instance({
        context: context,
        onData: (data) => {
          update(expr(data))
        },
      })
      function initPool() {
        let instance
        for (let i = 0; i < poolSize; i++) {
          instance = child.instantiate(context, subject.object)
          instance.detach()
          pool.push(instance)
        }
      }
      function update(array) {
        const unused = new Set(instances.keys())
        let key
        let item
        let instance
        if (!array) array = []
        for (let i = 0; i < array.length; i++) {
          item = array[i]
          key = item.key
          if (instances.has(key)) {
            instance = instances.get(key)
          } else {
            instance = createInstance()
            instances.set(key, instance)
          }
          instance.push(item)
          unused.delete(key)
        }
        for (key of unused) {
          instance = instances.get(key)
          instance.detach()
          instances.delete(key)
          pool.push(instance)
        }
      }
      function createInstance() {
        let instance = pool.pop()
        if (instance) {
          instance.attachTo(subject.object)
        } else {
          instance = child.instantiate(context, subject.object)
        }
        return instance
      }
    },
  }
}

export class ObjectNode extends SkinNode {
  compile(compiler, $el) {
    this.children = compiler.compileChildren($el)
    if (this.children.length !== 1) {
      throw new Error(
        'Expected exactly 1 children, ' + this.children.length + ' given'
      )
    }
    this.pool = +$el.attr('pool') || 1
    this.key = new Expression($el.attr('key'))
  }

  instantiate(context, container) {
    const batch = new PIXI.particles.ParticleContainer(undefined, {
      position: true,
      alpha: true,
    })
    const manager = new ChildManager(this.key, this.children[0], this.pool)
    return new Instance({
      context: context,
      parent: container,
      object: batch,
      concerns: [manager],
    })
  }
}

export default ObjectNode
