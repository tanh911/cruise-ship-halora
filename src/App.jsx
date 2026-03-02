import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Experience from './components/Experience';
import Overlay from './components/UI/Overlay';
import OceanScene from './components/Environment/OceanScene';
import AdOverlay from './components/UI/AdOverlay';
import RoomUI from './components/UI/RoomUI';
import LoadingScreen from './components/UI/LoadingScreen';
// import CameraDebugPanel from './components/UI/CameraDebugPanel'; // Debug panel - uncomment khi cần chỉnh camera
import './index.css';

function App() {
  const [targetView, setTargetView] = React.useState('default');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const handleViewChange = (newView) => {
    if (newView === targetView) return;

    setIsTransitioning(true);

    // Đợi hiệu ứng fade out hoàn tất (0.3s theo CSS mới)
    setTimeout(() => {
      setTargetView(newView);

      // Đợi thêm một chút để React Three Fiber khởi tạo cảnh mới
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 300);
  };

  return (
    <div className="app-container">
      {/* Lớp phủ chuyển cảnh */}
      <div className={`transition-overlay ${isTransitioning ? 'active' : ''}`} />

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
        <Suspense fallback={null}>
          <Experience targetView={targetView} setTargetView={handleViewChange} />
        </Suspense>
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
