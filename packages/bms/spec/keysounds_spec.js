const { Keysounds } = require('../lib')
const { expect } = require('chai')

describe('Keysounds', function () {
  describe('#files', function () {
    it('should get list of all files', function () {
      expect(
        new Keysounds({
          AA: 'a.wav',
          BB: 'a.ogg',
          CC: 'a.wav',
        }).files()
      ).to.deep.equal(['a.wav', 'a.ogg'])
    })
  })

  describe('#all', function () {
    it('should return the keysound map', function () {
      expect(
        new Keysounds({
          AA: 'a.wav',
          BB: 'a.ogg',
          CC: 'a.wav',
        }).all()
      ).to.deep.equal({
        AA: 'a.wav',
        BB: 'a.ogg',
        CC: 'a.wav',
      })
    })
  })
})
