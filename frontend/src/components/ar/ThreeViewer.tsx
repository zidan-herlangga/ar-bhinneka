import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Environment } from "@react-three/drei";

export function ThreeViewer() {
  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden bg-gray-900">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />
        <Box args={[1, 1, 1]} rotation={[0.4, 0.4, 0]}>
          <meshStandardMaterial color="#3B82F6" />
        </Box>
        <OrbitControls enablePan={false} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}