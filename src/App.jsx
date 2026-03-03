import React, { Suspense, useState, useTransition, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

function App() {
  const [targetView, setTargetView] = useState('default');
  const [isPending, startTransition] = useTransition();

  const handleViewChange = (newView) => {
    if (newView === targetView) return;

    // Sử dụng startTransition để render component 3D mới hoàn toàn ngầm dưới nền.
    // Cảnh 3D hiện tại sẽ giữ nguyên trên màn hình và không bị giật/đứt gãy
    // cho đến khi cảnh 3D mới load xong 100%.
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
          <Suspense fallback={null}>
            <Experience targetView={targetView} setTargetView={handleViewChange} />
          </Suspense>
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
    </div>
  );
}

export default App;
