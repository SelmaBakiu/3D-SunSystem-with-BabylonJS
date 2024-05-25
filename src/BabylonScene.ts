import {
  MeshBuilder,
  Texture,
  StandardMaterial,
  Color3,
  Engine,
  TouchCamera,
  SpotLight,
  Mesh,
  DirectionalLight,
  KeyboardEventTypes,
  FreeCameraMouseInput,
  FreeCamera,
  CubeTexture,
  UniversalCamera,
  Curve3,
} from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/loaders";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

export class BabylonScene {
  engine: Engine;
  scene: Scene | null | undefined;
  skybox: Mesh | null | undefined;
  cam: TouchCamera | undefined | null;


  constructor(readonly canvasElement: HTMLCanvasElement) {
    this.engine = new Engine(canvasElement, true, { deterministicLockstep: true, lockstepMaxSteps: 1 });
    this.scene = null;
    this.skybox = null;
    this.cam = null;
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  async run() {
    // entry point
    await this.setupScene();
    this.setupEnvironment();
    this.setupPlanet();
    this.engine.runRenderLoop(() => {
      if (!this.scene) {
        // scene is not yet set up
        console.log('error, scene is not set up')
        return;
      }
      this.scene.render();
    });
  }

  setupScene = async () => {
    this.engine.adaptToDeviceRatio = true;
    this.scene = new Scene(this.engine);

    this.setupCamera();
    await this.setupEnvironment(); // setup bacground 
    this.scene.onKeyboardObservable.add((info) => {  // helper ui for 3d scene
      if (info.type === KeyboardEventTypes.KEYDOWN && info.event.key === "x") {
        this.scene!.debugLayer.show();
      }
    });
    let cnt = 0;
    this.scene.onBeforeStepObservable.add(() => {
      console.log(cnt);
      cnt++;
    })
  };

  setupCamera = () => {
    if (!this.scene) {
      // console.log('error, scene is not set up')
      return;
    }
    const camera = new FreeCamera('camera', new Vector3(2, 13, 50), this.scene);
    camera.rotation = new Vector3(0.189, 3.24, 0);
    camera.attachControl(this.engine.getRenderingCanvas);

  };

  setupEnvironment = async () => {
    if (!this.scene) {
      // console.log('error, scene is not set up')
      return;
    }


    var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
    var skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    const light = new DirectionalLight("SunLight", new Vector3(0, 0, -1), this.scene);
    light.intensity = 0.5;

    if (this.skybox) {
      light.excludedMeshes.push(this.skybox);
    }
  }

  // SET UP PLANET
  setupPlanet = () => {

    const Sun = this.createPlanet("Sun", 10, 32, 0, 0, 0, "textures/Sun.jpg");

    const Mercury = this.createPlanet("Mercury", 0.3, 32, 10.3, 0, 0.1, "textures/Venus.jpg");
    this.setupOrbit(new Vector3(0, 0.1, 10.3), new Vector3(10.3, 0, 0.1), new Vector3(-10.3, 0, 0.1));

    const Venus = this.createPlanet("Venus", 0.8, 32, 11, 0, 0.2, "textures/Venus.jpg");
    this.setupOrbit(new Vector3(0.2, 0, 11), new Vector3(11, 0, 0.2), new Vector3(-11, 0, 0.2));

    const Earth = this.createPlanet("Earth", 0.9, 32, 12.5, 0, 0.3, "textures/Earth.jpg");
    this.setupOrbit(new Vector3(0.3, 0, 12.5), new Vector3(12.5, 0, 0.3), new Vector3(-12.5, 0, 0.3));

    const Moon = MeshBuilder.CreateSphere("Moon", { diameter: 0.25, segments: 32 });
    let Moonmaterial = new StandardMaterial("Moon");
    Moonmaterial.diffuseTexture = new Texture("textures/Venus.jpg", this.scene);
    Moon.material = Moonmaterial;


    const Mars = this.createPlanet("Mars", 0.5, 32, 14, 0, 0.4, "textures/Mars.jpg");
    this.setupOrbit(new Vector3(0.4, 0, 14), new Vector3(14, 0, 0.4), new Vector3(-14, 0, 0.4));

    const Jupiter = this.createPlanet("Jupiter", 5, 32, -19, 0, 0.5, "textures/Jupiter.jpg");
    this.setupOrbit(new Vector3(0.5, 0, -19), new Vector3(-19, 0, 0.5), new Vector3(19, 0, 0.5));

    const Saturn = this.createPlanet("Saturn", 3.8, 32, 25, 0, 0.6, "textures/Saturn.jpg");
    this.setupOrbit(new Vector3(0.6, 0, 25), new Vector3(25, 0, 0.6), new Vector3(-25, 0, 0.6));
    const SaturnRing = MeshBuilder.CreateSphere("sphere", { diameterX: 7, diameterY: 1, diameterZ: 6, segments: 32 });


    const Uranus = this.createPlanet("Uranus", 3.3, 32, -29.2, 0, 0.7, "textures/Uranus.jpg");
    this.setupOrbit(new Vector3(0.7, 0, -29.2), new Vector3(-29.2, 0, 0.7), new Vector3(29.2, 0, 0.7));

    const Neptune = this.createPlanet("Neptune", 3.3, 32, 35.2, 0, 0.8, "textures/Neptune.jpg");
    this.setupOrbit(new Vector3(0.8, 0, 35), new Vector3(35, 0, 0.8), new Vector3(-35, 0, 0.8));

    const Pluto = this.createPlanet("Pluto", 0.3, 32, 40, 0, 0.9, "textures/Pluto.jpg");
    this.setupOrbit(new Vector3(0.9, 0, 40), new Vector3(40, 0, 0.9), new Vector3(-40, 0, 0.9));


    //ROTATION
    this.scene?.onAfterRenderObservable.add(async (): Promise<void> => {

      Moon.position.x = Earth.position.x + 0.6;
      Moon.position.y = Earth.position.y + 0.1;
      Moon.position.z = Earth.position.z;

      Mercury.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 880 * this.engine.getDeltaTime());
      Venus.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), -Math.PI / 2240 * this.engine.getDeltaTime());
      Earth.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 3650 * this.engine.getDeltaTime());
      Moon.rotateAround(new Vector3(Earth.position.x, Earth.position.y, Earth.position.z), new Vector3(0, 1, 0), Math.PI / 380 * this.engine.getDeltaTime());
      Mars.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 5000 * this.engine.getDeltaTime());
      Jupiter.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 43800 * this.engine.getDeltaTime());
      Saturn.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), -Math.PI / 105840 * this.engine.getDeltaTime());
      Uranus.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 306600 * this.engine.getDeltaTime());
      Neptune.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 598600 * this.engine.getDeltaTime());
      Pluto.rotateAround(new Vector3(Sun.position.x, Sun.position.y, Sun.position.z), new Vector3(0, 1, 0), Math.PI / 905200 * this.engine.getDeltaTime());

      SaturnRing.position.x = Saturn.position.x;
      SaturnRing.position.y = Saturn.position.y;
      SaturnRing.position.z = Saturn.position.z;

    })


    //REVOLUTION
    this.scene?.registerBeforeRender(() => {

      Sun.rotation.y = Sun.rotation.y + 0.0001 * this.engine.getDeltaTime();
      Mercury.rotation.y = Mercury.rotation.y + 58 * this.engine.getDeltaTime();
      Venus.rotation.y = Venus.rotation.y + 243 * this.engine.getDeltaTime();
      Earth.rotation.y = Earth.rotation.y + 1 * this.engine.getDeltaTime();
      Moon.rotation.y = Pluto.rotation.y + 0.1 * this.engine.getDeltaTime();
      Mars.rotation.y = Mars.rotation.y + 1.1 * this.engine.getDeltaTime();
      Jupiter.rotation.y = Jupiter.rotation.y + 0, 4 * this.engine.getDeltaTime();
      Saturn.rotation.y = Saturn.rotation.y + 0.45 * this.engine.getDeltaTime();
      Uranus.rotation.y = Uranus.rotation.y + 0.7 * this.engine.getDeltaTime();
      Neptune.rotation.y = Neptune.rotation.y + 0.6 * this.engine.getDeltaTime();
      Pluto.rotation.y = Pluto.rotation.y + 45 * this.engine.getDeltaTime();


    });
  }

  // Function that create planet
  createPlanet(this: any, name: string,
    diameter: number,
    segments: number,
    x: number,
    y: number,
    z: number,
    url: string): Mesh {

    const planet = MeshBuilder.CreateSphere(name, { diameter: diameter, segments: segments });
    planet.position.x = x;
    planet.position.y = y;
    planet.position.y = z;
    let material = new StandardMaterial(name);
    material.diffuseTexture = new Texture(url, this.scene);
    planet.material = material;
    return planet;

  }

  // Function that create orbits
  setupOrbit(f: Vector3, s: Vector3, t: Vector3): void {

    const arc = Curve3.ArcThru3Points(s, t, f, 60, false, true);
    const arcLine = MeshBuilder.CreateLines("arc", { points: arc.getPoints() })

  }
};





