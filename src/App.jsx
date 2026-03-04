import React, { Suspense, useState, useTransition, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Experience from './components/Experience';
import Overlay from './components/UI/Overlay';
import OceanScene from './components/Environment/OceanScene';
import AdOverlay from './components/UI/AdOverlay';
import RoomUI from './components/UI/RoomUI';
import LoadingScreen from './components/UI/LoadingScreen';
import SceneErrorBoundary from './components/UI/SceneErrorBoundary';
// import CameraDebugPanel from './components/UI/CameraDebugPanel'; // Debug panel
import './index.css';

// Preload models globally to avoid delay when switching views
useGLTF.preload('./models/cruise-ship-optimized.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
useGLTF.preload('./models/premiumTripleRoom-optimized.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

function App() {
  const [targetView, setTargetView] = useState('default');
  const [isPending, startTransition] = useTransition();

  const handleViewChange = (newView) => {
    if (newView === targetView) return;

    // Sử dụng startTransition để render component 3D mới ngầm dưới nền.
    // Kết hợp với việc dời Suspense vào bên trong từng component (Experience.jsx),
    // giúp loại bỏ hoàn toàn hiện tượng nháy đen khi chuyển cảnh.
    startTransition(() => {
      setTargetView(newView);
    });
  };

  return (
    <div className="app-container">
      <LoadingScreen />

      <Canvas
        camera={{ position: [67.5, 30, 25.5], fov: 70, near: 0.1, far: 5000 }}
        gl={{
          antialias: true,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping
        }}
      >
        <SceneErrorBoundary>
          <Experience targetView={targetView} setTargetView={handleViewChange} />
        </SceneErrorBoundary>
      </Canvas>

      <AdOverlay
        onExplore={handleViewChange}
        visible={targetView === 'default' || targetView === 'sundeck' || targetView === 'suite'}
      />

      <RoomUI
        onBack={() => handleViewChange('default')}
        visible={targetView !== 'default'}
      />

      <div style={{ height: '200vh', pointerEvents: 'none' }}></div>
      {/* <CameraDebugPanel /> */}
    </div>
  );
}

export default App;
