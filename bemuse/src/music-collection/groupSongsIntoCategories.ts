import { Song } from 'bemuse/collection-model/types'
import { SongOfTheDay } from './SongOfTheDay'
import _ from 'lodash'

interface Grouping {
  title: string
  criteria: (song: Song, context: { songOfTheDay: SongOfTheDay }) => boolean
  sort?: (song: Song) => string
  reverse?: boolean
}

const grouping: readonly Grouping[] = [
  { title: 'Custom Song', criteria: (song) => !!song.custom },
  { title: 'Tutorial', criteria: (song) => !!song.tutorial },
  { title: 'Unreleased', criteria: (song) => !!song.unreleased },
  {
    title: 'Recently Added Songs',
    criteria: (song) =>
      !!song.added && Date.now() - Date.parse(song.added) < 60 * 86400000,
    sort: (song) => song.added ?? '',
    reverse: true,
  },
  {
    title: 'Random Songs of the Day',
    criteria: (song, context) => context.songOfTheDay.isSongOfTheDay(song.id),
  },
  { title: '☆', criteria: () => true },
]

export function groupSongsIntoCategories(
  songs: readonly Song[],
  { songOfTheDayEnabled = false } = {}
) {
  const context = {
    songOfTheDay: new SongOfTheDay(songs, { enabled: songOfTheDayEnabled }),
  }
  const groups = grouping.map((group) => ({
    input: group,
    output: { title: group.title, songs: [] as Song[] },
  }))
  for (const song of songs) {
    for (const { input, output } of groups) {
      if (input.criteria(song, context)) {
        output.songs.push(song)
        break
      }
    }
  }
  for (const { input, output } of groups) {
    if (input.sort) {
      output.songs = _.orderBy(
        output.songs,
        [input.sort],
        [input.reverse ? 'desc' : 'asc']
      )
    } else if (input.reverse) {
      output.songs.reverse()
    }
  }
  return _(groups)
    .map('output')
    .filter((group) => group.songs.length > 0)
    .value()
}

export default groupSongsIntoCategories
