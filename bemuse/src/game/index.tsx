import * as GameLoader from './loaders/game-loader'

import GameShellScene, { OptionsDraft } from './ui/GameShellScene'
import { SceneManager, SceneManagerContext } from 'bemuse/scene-manager'

import BemusePackageResources from 'bemuse/resources/bemuse-package'
import GameScene from './game-scene'
import LoadingScene from './ui/LoadingScene'
import { Provider } from 'react-redux'
import React from 'react'
import URLResource from 'bemuse/resources/url'
import audioContext from 'bemuse/audio-context'
import configureStore from 'bemuse/app/redux/configureStore'
import { isScratchPosition } from 'bemuse/app/entities/Options'
import query from 'bemuse/utils/query'
import { unmuteAudio } from 'bemuse/sampling-master'

const sceneManager = new SceneManager(({ children }) => (
  <SceneManagerContext.Provider value={sceneManager}>
    <Provider store={configureStore()}>{children}</Provider>
  </SceneManagerContext.Provider>
))

export async function main() {
  // iOS
  window.addEventListener('touchstart', function unmute() {
    unmuteAudio(audioContext)
    window.removeEventListener('touchstart', unmute)
  })

  const displayShell = function (options: OptionsDraft): Promise<OptionsDraft> {
    return new Promise(function (resolve) {
      const scene = (
        <GameShellScene
          options={options}
          play={(data) => {
            resolve(data)
          }}
        />
      )
      sceneManager.display(scene)
    })
  }

  const getSong = async function (): Promise<GameLoader.LoadSpec> {
    const kbm = (query.keyboard || '').split(',').map((x) => +x)
    const options: OptionsDraft = {
      url: query.bms || '/music/[snack]dddd/dddd_sph.bme',
      game: {
        audioInputLatency: +query.latency || 0,
      },
      players: [
        {
          speed: +query.speed || 3,
          autoplay: !!query.autoplay,
          placement: 'center',
          scratch: isScratchPosition(query.scratch) ? query.scratch : 'left',
          input: {
            keyboard: {
              1: kbm[0] || 83,
              2: kbm[1] || 68,
              3: kbm[2] || 70,
              4: kbm[3] || 32,
              5: kbm[4] || 74,
              6: kbm[5] || 75,
              7: kbm[6] || 76,
              SC: kbm[7] || 65,
              SC2: kbm[8] || 16,
            },
          },
        },
      ],
    }
    const newOptions = await displayShell(options)
    const url = newOptions.url
    const assetsUrl = new URL('assets/', url)
    const metadata = {
      title: 'Loading',
      subtitles: [] as string[],
      artist: '',
      genre: '',
      subartists: [] as string[],
      difficulty: 0,
      level: 0,
    }
    return {
      bms: newOptions.resource || new URLResource(url),
      assets: newOptions.resources || new BemusePackageResources(assetsUrl),
      metadata: metadata,
      options: Object.assign({}, newOptions.game, {
        players: newOptions.players,
      }),
    }
  }

  const loadSpec = await getSong()
  const { tasks, promise } = GameLoader.load(loadSpec)
  await sceneManager.display(
    <LoadingScene tasks={tasks} song={loadSpec.metadata} />
  )
  const controller = await promise
  await sceneManager.display(GameScene(controller.display))
  controller.start()
}
