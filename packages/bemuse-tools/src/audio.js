import { basename, extname } from 'path'

import Throat from 'throat'
import { cpus } from 'os'
import endpoint from 'endpoint'
import fs from 'fs'
import { spawn } from 'child_process'

const throat = new Throat(cpus().length || 1)

export class AudioConvertor {
  constructor(type, ...extra) {
    this._target = type
    this._extra = extra
  }

  convert(file) {
    const ext = extname(file.name).toLowerCase()
    if (ext === '.' + this._target && !this.force) {
      return Promise.resolve(file)
    } else {
      const name = basename(file.name, ext) + '.' + this._target
      return this._doConvert(file.path, this._target).then((buffer) =>
        file.derive(name, buffer)
      )
    }
  }

  _doConvert(path, type) {
    return this._SoX(path, type)
  }

  async _SoX(path, type) {
    let typeArgs = []
    try {
      const fd = await fs.promises.open(path, 'r')
      const buffer = Buffer.alloc(4)
      const read = (
        await fd.read({
          buffer,
          byteOffset: 0,
          byteLength: 4,
        })
      ).bytesRead
      await fd.close()
      if (read === 0) {
        console.error('[WARN] Empty keysound file.')
      } else if (
        buffer[0] === 0x49 &&
        buffer[1] === 0x44 &&
        buffer[2] === 0x33
      ) {
        typeArgs = ['-t', 'mp3']
      } else if (buffer[0] === 0xff && buffer[1] === 0xfb) {
        typeArgs = ['-t', 'mp3']
      } else if (
        buffer[0] === 0x4f &&
        buffer[1] === 0x67 &&
        buffer[2] === 0x67 &&
        buffer[3] === 0x53
      ) {
        typeArgs = ['-t', 'ogg']
      }
    } catch (e) {
      console.error('[WARN] Unable to detect file type!')
    }
    return this._doSoX(path, type, typeArgs)
  }

  _doSoX(path, type, inputTypeArgs) {
    return throat(
      () =>
        new Promise((resolve, reject) => {
          const sox = spawn('sox', [
            ...inputTypeArgs,
            path,
            '-t',
            type,
            ...this._extra,
            '-',
          ])
          sox.stdin.end()
          sox.stderr.on('data', (x) => process.stderr.write(x))
          const data = new Promise((resolve, reject) => {
            sox.stdout.pipe(
              endpoint((err, buffer) => {
                if (err) {
                  console.error('Error reading audio!')
                  reject(err)
                } else {
                  resolve(buffer)
                }
              })
            )
          })
          sox.on('close', (code) => {
            if (code === 0) {
              resolve(data)
            } else {
              console.error(
                'Unable to convert audio file -- SoX exited ' + code
              )
              reject(new Error('SoX process exited: ' + code))
            }
          })
        })
    )
  }
}

export default AudioConvertor
