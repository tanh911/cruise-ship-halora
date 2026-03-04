import React, { Suspense, useState, useTransition, useEffect, useCallback, useRef } from 'react';
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
import SceneTransition from './components/UI/SceneTransition';
import './index.css';

// Preload models globally to avoid delay when switching views
useGLTF.preload('./models/cruise-ship-optimized.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
useGLTF.preload('./models/premiumTripleRoom-optimized.glb', 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
useGLTF.preload('./models/test_room.glb');

function App() {
  const [targetView, setTargetView] = useState('default');
  const [isPending, startTransition] = useTransition();
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingView = useRef(null);

  const handleViewChange = useCallback((newView) => {
    if (newView === targetView) return;

    // Trigger transition animation
    pendingView.current = newView;
    setIsTransitioning(true);
  }, [targetView]);

  // Called at the midpoint of the transition (screen is fully dark)
  const handleTransitionMidpoint = useCallback(() => {
    if (pendingView.current) {
      setTargetView(pendingView.current);
      pendingView.current = null;
    }
  }, []);

  // Called when transition completely finishes fading out
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const handleReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  return (
    <div className="app-container">
      <LoadingScreen isSceneReady={isSceneReady} />
      <SceneTransition
        isTransitioning={isTransitioning}
        onMidpoint={handleTransitionMidpoint}
        onComplete={handleTransitionComplete}
      />

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
          <Experience
            targetView={targetView}
            setTargetView={handleViewChange}
            onReady={handleReady}
          />
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
