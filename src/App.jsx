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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewChange = (newView) => {
    if (newView === targetView) return;

    setIsTransitioning(true); // Fade to black

    // Đợi hiệu ứng fade out hoàn tất (0.3s)
    setTimeout(() => {
      // Dùng startTransition để render component mới ngầm dưới nền
      // Màn hình đen (transition-overlay) sẽ che phủ phần canvas trong lúc load
      startTransition(() => {
        setTargetView(newView);
      });
    }, 300);
  };

  // Tự động tắt màn hình đen chuyển cảnh khi component mới đã render xong
  useEffect(() => {
    if (!isPending && isTransitioning) {
      // Đợi thêm một chút để React Three Fiber khởi tạo 3D
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isPending, isTransitioning, targetView]);


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
