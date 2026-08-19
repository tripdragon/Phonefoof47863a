# rubixwai implementation plan

AI contributors should read this file as the plan for this feature.

- Give every new concept its own class file.
- Every class that represents a 3D object must extend `THREE.Object3D`.
- Keep `RubixMega` responsible for its piece references and traditional face colors.
- Build each `Piece` from six shader-driven planes; the four piece types are core, center, edge, and corner.
- Keep scene, camera, lighting, controls, rendering, and cleanup in `RubixWaiScene`.
- Keep route markup and page lifecycle in `RubixWaiPage`.
