import { BabylonScene } from './BabylonScene'

window.addEventListener('DOMContentLoaded', async() => {

  let canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
  const app = new BabylonScene(canvas)

  await app.run()
});