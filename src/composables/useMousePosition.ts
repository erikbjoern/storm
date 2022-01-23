import { getRemInPixels } from './useRemSize'

type PositionType = 'BULLET_POINT_OFFSET' | 'CLOSEST_SNAPPING_POINT' | 'CLOSEST_FREE_SNAPPING_POINT'

type Coords = {
  x: number
  y: number
}

const SNAPPING_DISTANCE = getRemInPixels(2)
const BULLET_POINT_OFFSET = {
  x: SNAPPING_DISTANCE / 4,
  y: SNAPPING_DISTANCE / 2,
}

const roundClosest = (n: number, amount: number) => Math.round(n / amount) * amount

export function getCoordinateFromCursor(
  cursorCoordinates: Coords,
  positionType: PositionType,
  targetAxis: 'x' | 'y',
  nodeList?: { coordinates: Coords }[]
): number {
  const getClosestSnappingPoint = () => {
    return Math.max(0, roundClosest(cursorCoordinates[targetAxis], SNAPPING_DISTANCE))
  }

  if (positionType == 'BULLET_POINT_OFFSET') {
    return cursorCoordinates[targetAxis] - BULLET_POINT_OFFSET[targetAxis]
  }

  if (positionType == 'CLOSEST_SNAPPING_POINT') {
    return getClosestSnappingPoint()
  }

  if (positionType == 'CLOSEST_FREE_SNAPPING_POINT') {
    let closestSnappingPoint = getClosestSnappingPoint()

    const closestSnappingPointIsOccupied = () => {
      const crossAxis = targetAxis == 'x' ? 'y' : 'x'

      if (nodeList === undefined) {
        console.error('nodelist is required when getting closest free point')
        return
      }

      return nodeList.some(
        n =>
          n.coordinates[crossAxis] == cursorCoordinates[crossAxis] &&
          n.coordinates[targetAxis] == closestSnappingPoint
      )
    }

    while (closestSnappingPointIsOccupied()) {
      closestSnappingPoint += SNAPPING_DISTANCE
    }

    return closestSnappingPoint
  }

  console.error('getCoordinateFromCursor received bad params')
  return 0
}
