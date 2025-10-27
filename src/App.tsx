import React, { useEffect, useRef } from "react";
// CubeChess Webpage Prototype
// Single-file React component (Tailwind CSS used for styling)
// - Renders a landing page / hero
// - Includes an interactive Three.js canvas that displays a rotatable cube with a visible grid (3x3 default)
// - File is intended as a starting point; you can drop it into a CRA/Vite React app with Tailwind.

export default function CubeChessPrototype() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Lazy-load three to keep bundle optional in minimal setups
    let THREE;
    let renderer, scene, camera, controls, animId;
    let cubeGroup;

    const init = async () => {
      THREE = await import("three");
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls"
      );

      const width = mountRef.current.clientWidth;
      const height = Math.max(400, window.innerHeight * 0.45);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.outputEncoding = THREE.sRGBEncoding;

      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf7f7fb);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(4, 4, 6);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 3;
      controls.maxDistance = 20;

      // Ambient + directional light
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const dl = new THREE.DirectionalLight(0xffffff, 0.6);
      dl.position.set(5, 10, 7);
      scene.add(dl);

      // Helper grid cube
      cubeGroup = buildCubeGrid(3, 2.4, THREE);
      scene.add(cubeGroup);

      // soft ground plane shadow
      const planeGeo = new THREE.PlaneGeometry(20, 20);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1.6;
      scene.add(plane);

      const onResize = () => {
        const w = mountRef.current.clientWidth;
        const h = Math.max(400, window.innerHeight * 0.45);
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("resize", onResize);

      const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        animId = requestAnimationFrame(animate);
      };
      animate();

      // cleanup
      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animId);
        controls.dispose();
        renderer.dispose();
        mountRef.current.removeChild(renderer.domElement);
      };
    };

    let cleanupPromise;
    init().then((cleanup) => (cleanupPromise = cleanup)).catch(console.error);

    return () => {
      if (cleanupPromise) cleanupPromise();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <header className="max-w-6xl mx-auto p-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Cube Chess</h1>
        <nav className="space-x-4 text-sm text-gray-600">
          <a className="hover:underline">Home</a>
          <a className="hover:underline">Prototype</a>
          <a className="hover:underline">Docs</a>
          <a className="hover:underline">Contact</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-2 gap-8 items-start">
        <section>
          <div className="rounded-2xl p-8 bg-white shadow">
            <h2 className="text-3xl font-bold mb-2">Play chess on a cube — yes really.</h2>
            <p className="text-gray-600 mb-6">
              Cube Chess takes classic chess and folds it into 3D. Start with a
              3×3×3 board for simple games, or crank difficulty with 4×4×4 and
              5×5×5 variants. Drag, spin, and explore the cube — rules are
              flexible and you’ll be able to paste your custom rules later.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 border rounded">
                <h4 className="font-semibold">MVP</h4>
                <ul className="text-sm text-gray-600 list-disc ml-5 mt-2">
                  <li>Interactive 3D cube</li>
                  <li>Turn-based multiplayer</li>
                  <li>Move validation & history</li>
                </ul>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold">Nice to have</h4>
                <ul className="text-sm text-gray-600 list-disc ml-5 mt-2">
                  <li>AI opponent</li>
                  <li>Profile & ratings</li>
                  <li>Spectator mode</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try Prototype</button>
              <button className="px-4 py-2 border rounded text-gray-700">Upload Rules / Images</button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Tip: Paste your rules here later — I’ll wire them into the game logic.
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Notes</h3>
            <div className="rounded-lg overflow-hidden border">
              <img alt="notebook-scan" src="/WIN_20251017_11_58_48_Pro.jpg" />
            </div>
          </div>
        </section>

        <aside>
          <div className="rounded-2xl overflow-hidden bg-white shadow">
            <div className="p-4 border-b">
              <h4 className="font-semibold">3D Prototype</h4>
              <p className="text-sm text-gray-500">Rotate the cube, zoom and inspect. (Prototype)</p>
            </div>
            <div ref={mountRef} style={{ width: "100%", height: 480 }} />
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Grid: 3×3 (changeable)</div>
              <div className="text-sm text-gray-600">Status: Prototype</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded shadow">
            <h4 className="font-semibold mb-2">Next actions</h4>
            <ol className="list-decimal list-inside text-sm text-gray-700">
              <li>Paste the final rules (pawn, knight, traveler, etc.)</li>
              <li>I’ll add move validation & UI for piece placement</li>
              <li>Connect multiplayer & save games</li>
            </ol>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-sm text-gray-500">© Cube Chess — Prototype</footer>
    </div>
  );
}

// ------------------ Helper: builds a visible grid cube ------------------
function buildCubeGrid(n = 3, size = 2.4, THREE) {
  // n: subdivisions per face (3 -> 3x3)
  // size: cube width in world units
  const group = new THREE.Group();

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x111827, linewidth: 1 });
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  // Big slightly transparent cube for volume
  const box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), faceMat);
  box.material.opacity = 0.95;
  box.material.transparent = true;
  group.add(box);

  // Outer wireframe edges
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
  group.add(new THREE.LineSegments(edges, edgeMat));

  // Draw grid lines on each face
  const half = size / 2;
  const step = size / n;

  // helper to create lines for a single face given a transform
  const makeFaceGrid = (offset, uDir, vDir) => {
    const lines = [];
    for (let i = 1; i < n; i++) {
      // horizontal line
      const a = new THREE.Vector3()
        .copy(offset)
        .add(uDir.clone().multiplyScalar(-half))
        .add(vDir.clone().multiplyScalar(-half + i * step));
      const b = new THREE.Vector3()
        .copy(offset)
        .add(uDir.clone().multiplyScalar(half))
        .add(vDir.clone().multiplyScalar(-half + i * step));
      lines.push(a.x, a.y, a.z, b.x, b.y, b.z);

      // vertical line
      const c = new THREE.Vector3()
        .copy(offset)
        .add(uDir.clone().multiplyScalar(-half + i * step))
        .add(vDir.clone().multiplyScalar(-half));
      const d = new THREE.Vector3()
        .copy(offset)
        .add(uDir.clone().multiplyScalar(-half + i * step))
        .add(vDir.clone().multiplyScalar(half));
      lines.push(c.x, c.y, c.z, d.x, d.y, d.z);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    return new THREE.LineSegments(geom, edgeMat);
  };

  // +Z face (front)
  group.add(
    makeFaceGrid(new THREE.Vector3(0, 0, half + 0.001), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0))
  );
  // -Z back
  group.add(
    makeFaceGrid(new THREE.Vector3(0, 0, -half - 0.001), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0))
  );
  // +X right
  group.add(
    makeFaceGrid(new THREE.Vector3(half + 0.001, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0))
  );
  // -X left
  group.add(
    makeFaceGrid(new THREE.Vector3(-half - 0.001, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0))
  );
  // +Y top
  group.add(
    makeFaceGrid(new THREE.Vector3(0, half + 0.001, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1))
  );
  // -Y bottom
  group.add(
    makeFaceGrid(new THREE.Vector3(0, -half - 0.001, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1))
  );

  // add a subtle rotation so user sees depth initially
  group.rotation.y = -0.4;
  group.rotation.x = 0.15;

  return group;
}
