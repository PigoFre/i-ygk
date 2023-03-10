import {
  ARCHIVE_REGEXP,
  CustomSongResources,
  downloadFileEntryFromURL,
} from './custom-song-resources'
import { FileEntry, ICustomSongResources, LoggingFunction } from './types'

import { addUnprefixed } from './addUnprefixed'

// TODO [#634]: Remove the `DndResources` class and have users of this class create a `CustomSongResources` directly.
//
// The original implementation of DndResources class has been extracted
// into a CustomSongResources superclass in commit cc6a6e70586487ef476890f5a7911837186a7a32,
// so that part of its logic can be re-used in other contexts, such as in commit ba9e15bab72fec17a144e40433cb3a4ffd31db5b.
//
// Now this `DndResources` class is really dumb and we want to prefer composition over inheritance.
// This class should be removed.
export class DndResources
  extends CustomSongResources
  implements ICustomSongResources
{
  constructor(event: DragEvent) {
    super({
      getFiles: (log) => getFilesFromEvent(event, log),
    })
  }
}

export default DndResources

async function getFilesFromEvent(
  event: DragEvent,
  log: LoggingFunction
): Promise<FileEntry[]> {
  const out: FileEntry[] = []
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    throw new Error('Expect event.dataTransfer to be present')
  }
  if (dataTransfer.types.indexOf('text/uri-list') > -1) {
    const url = dataTransfer
      .getData('text/uri-list')
      .split(/\r\n|\r|\n/)
      .filter((t) => t && !t.startsWith('#'))[0]
    if (ARCHIVE_REGEXP.test(url && url.replace(/[?#].*/, ''))) {
      log('Link to archive file detected. Trying to download')
      return [await downloadFileEntryFromURL(url, log)]
    }
  } else if (dataTransfer.items) {
    for (const item of Array.from(dataTransfer.items)) {
      await readItem(item)
    }
  } else if (dataTransfer.files) {
    for (const file of Array.from(dataTransfer.files)) {
      addFile(file)
    }
  }
  return out

  async function readItem(item: DataTransferItem) {
    const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
    if (entry) {
      await readEntry(entry)
    } else {
      const file = item.getAsFile && item.getAsFile()
      if (file) addFile(file)
    }
  }

  function readEntry(entry: any, prefix = '') {
    if (entry.isFile) {
      return readFile(entry, prefix)
    } else if (entry.isDirectory) {
      return readDirectory(entry, prefix)
    }
  }

  async function readFile(entry: any, prefix = '') {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file(resolve, reject)
    })
    addFile(file, prefix)
    return file
  }

  async function readDirectory(dir: any, prefix = '') {
    const entries: any[] = []
    const reader = dir.createReader()
    const readMore = () =>
      new Promise<any>((resolve, reject) => {
        reader.readEntries(resolve, reject)
      })
    for (;;) {
      const results = await readMore()
      if (!results || results.length === 0) break
      entries.push(...Array.from(results))
    }
    for (const entry of entries) {
      await readEntry(entry, prefix + dir.name + '/')
    }
  }

  function addFile(file: File, prefix = '') {
    if (file) {
      addUnprefixed(prefix, file.name, (name) => {
        out.push({ name, file })
      })
    }
  }
}
