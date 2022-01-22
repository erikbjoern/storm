const modules = import.meta.glob('./use*')

function parsePath(path: string) {
  const parts = /^(.*[\\/])?(.*?)(\.[^.]*?|)$/gi.exec(path) || []

  return {
    path: parts[0] || '',
    subpath: parts[1] || '',
    name: parts[2] || '',
    extension: parts[3] || '',
  }
}

const children: {
  [key: string]: {
    [functionName: string]: Function
  }
} = {}

for (const path in modules) {
  const func = await import(path)
  const parts = parsePath(path)

  children[parts.name] = func
}

export default children as {
  useRemSize: { getRemInPixels: Function }
  useMousePosition: { getCoordinateFromCursor: Function }
}
