import $ from 'jquery'

export default function GameScene(display) {
  return function (container) {
    const handler = () => false
    $(window).on('touchstart', handler)
    showCanvas(display, container)
    return {
      teardown() {
        $(window).off('touchstart', handler)
      },
    }
  }
}

function showCanvas(display, container) {
  const { view, wrapper } = display
  const { width, height } = view
  container.appendChild(wrapper)
  container.addEventListener('touchstart', disableContextMenu)
  function disableContextMenu() {
    container.removeEventListener('touchstart', disableContextMenu)
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  resize()
  $(window).on('resize', resize)

  function resize() {
    const scale = Math.min(
      window.innerWidth / width,
      window.innerHeight / height
    )
    view.style.width = Math.round(width * scale) + 'px'
    view.style.height = Math.round(height * scale) + 'px'
    wrapper.style.width = Math.round(width * scale) + 'px'
    wrapper.style.height = Math.round(height * scale) + 'px'
    const yOffset = (window.innerHeight - height * scale) / 2
    wrapper.style.marginTop = Math.round(yOffset) + 'px'
  }

  return wrapper
}
