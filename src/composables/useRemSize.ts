export function getRemInPixels(remValue: number) {
  return remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
}