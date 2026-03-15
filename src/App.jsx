import React, { useState, useTransition, Suspense, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import Experience from './components/Experience'
import AdOverlay from './components/UI/AdOverlay'
import RoomUI from './components/UI/RoomUI'
import LoadingScreen from './components/UI/LoadingScreen'
import SceneErrorBoundary from './components/UI/SceneErrorBoundary'

// preload đã bị xóa để tránh treo Chrome khi reload
// useGLTF.preload('/models/base.glb')

function App() {
  const [targetView, setTargetView] = useState('default')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [fadeOpacity, setFadeOpacity] = useState(0)
  const [contextLost, setContextLost] = useState(false);
  const [, startTransition] = useTransition();

  const canvasRef = useRef();

  const handleViewChange = (view) => {
    setFadeOpacity(0);
    if (targetView === 'default' && view === 'premium') {
      setIsZooming(true);
      setIsTransitioning(true);
      // We don't setTargetView yet, Experience will handle it after zoom
      return;
    }

    setIsTransitioning(true);
    startTransition(() => {
      setTargetView(view);
    });
  };

  const handleZoomComplete = () => {
    setIsZooming(false);
    startTransition(() => {
      setTargetView('premium');
      setFadeOpacity(0);
    });
  };

  const onCreated = useCallback((state) => {
    const canvas = state.gl.domElement;
    canvasRef.current = canvas;

    // 🔥 User suggested listeners
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL Context Lost, trying to restore...');
      setContextLost(true);
    });

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL Context Restored');
      setContextLost(false);
      // Logic phục hồi scene nếu cần
    });
  }, []);

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <LoadingScreen />

      {/* Cinematic Fade Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        opacity: fadeOpacity,
        pointerEvents: 'none',
        zIndex: 100,
        transition: 'opacity 0.2s ease-out'
      }} />

      {contextLost && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: '#050812', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', zIndex: 99999, color: '#d4af37'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '15px' }}>RECOVERING...</div>
          <div style={{ fontSize: '12px', color: '#888' }}>WebGL context lost. Please wait or refresh.</div>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '20px', padding: '10px 25px', background: 'transparent',
            border: '1px solid #d4af37', color: '#d4af37', cursor: 'pointer'
          }}>REFRESH</button>
        </div>
      )}

      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [-246.8, 10.4, -90.1], fov: 45, near: 1.0, far: 10000 }}
          dpr={[1, 1.5]}
          gl={{
            preserveDrawingBuffer: false,
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
            alpha: false,
            stencil: false,
            depth: true,
            precision: "highp"
          }}
          onCreated={onCreated}
        >
          <SceneErrorBoundary>
            <Experience
              targetView={targetView}
              setTargetView={setTargetView}
              isZooming={isZooming}
              onZoomComplete={handleZoomComplete}
              setFadeOpacity={setFadeOpacity}
              onReady={() => setIsTransitioning(false)}
            />
          </SceneErrorBoundary>
        </Canvas>
      </Suspense>

      <AdOverlay
        onExplore={handleViewChange}
        visible={targetView === 'default' && !isZooming}
      />

      <RoomUI
        onBack={() => handleViewChange('default')}
        visible={targetView !== 'default'}
        targetView={targetView}
      />
    </div>
  )
}

export default App