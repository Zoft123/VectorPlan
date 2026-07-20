import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Inspector } from './components/Inspector';
import { Canvas } from './components/Canvas';
import { HomeAssistantModal } from './components/HomeAssistantModal';
import { CodeModal } from './components/CodeModal';

export default function App() {
  const [entities, setEntities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1600, height: 900 });
  const [isDark, setIsDark] = useState(true);
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState('yaml');

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [roomNamePrompt, setRoomNamePrompt] = useState(null);
  const [roomNameInput, setRoomNameInput] = useState('');

  const [showHAModal, setShowHAModal] = useState(false);
  const [haConfig, setHaConfig] = useState({ type: 'local', url: 'http://homeassistant.local:8123', customUrl: '', token: '' });
  const [haEntities, setHaEntities] = useState([]);
  const [haStatus, setHaStatus] = useState({ loading: false, error: null, connected: false });

  const [editorSettings, setEditorSettings] = useState({
    snap: false,
    grid: false,
    gridSize: 10,
    snapDistance: 12,
    mode: 'edit'
  });

  const [paths, setPaths] = useState({
    svg: '/local/floorplan/floorplan_generated.svg?v=1',
    css: '/local/floorplan/floorplan_generated.css?v=1',
    offImage: '/local/floorplan/lights_off.png'
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };
    
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === 'Escape') {
        if (drawingMode) { setDrawingMode(false); setDrawnPoints([]); }
        if (isFullscreen) setIsFullscreen(false);
        if (roomNamePrompt) setRoomNamePrompt(null);
      }
      
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoom(z => Math.min(z + 0.25, 4));
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(z => Math.max(z - 0.25, 0.25));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingMode, isFullscreen, roomNamePrompt]);

  const updateEntity = (id, updates) => setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

  const addEntity = (kind) => {
    const id = Date.now();
    const newEnt = {
      id, kind, name: `New ${kind}`,
      entityId: ['Door', 'Window'].includes(kind) ? '' : `${kind.toLowerCase()}.new_${kind.toLowerCase()}`,
      svgId: `new_${kind.toLowerCase()}`,
      x: canvasSize.width / 2, y: canvasSize.height / 2, radius: kind === 'Garage' ? 60 : 40,
      lightStyle: 'glow', targetRoomId: '', glowRx: 150, glowRy: 150, whiteIntensity: 60, tintIntensity: 50,
      spinSpeed: '2s', spinDirection: 'spin-cw', color: '#94a3b8',
      unlockedColor: '#22c55e', lockedColor: '#000000', 
      onColor: '#22c55e', offColor: '#94a3b8',
      width: 80, depth: 10, angle: 0, flip: false,
      customSVG: '', isOn: false
    };
    setEntities([...entities, newEnt]);
    setSelectedId(id);
    setShowAddMenu(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgImage(e.target.result);
        const img = new Image();
        img.onload = () => {
          setCanvasSize({ width: img.width || 1600, height: img.height || 900 });
          setZoom(1); 
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="min-h-screen h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col overflow-hidden">
        
        <Header 
          isDark={isDark} setIsDark={setIsDark}
          isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen}
          showAddMenu={showAddMenu} setShowAddMenu={setShowAddMenu}
          drawingMode={drawingMode} setDrawingMode={setDrawingMode}
          setIsPanMode={setIsPanMode} setShowHAModal={setShowHAModal}
          setShowCode={setShowCode} addEntity={addEntity}
          haStatus={haStatus} dropdownRef={dropdownRef}
        />

        <div className="flex flex-1 p-6 gap-6 overflow-hidden min-h-0">
          {!isFullscreen && (
            <Inspector 
              entities={entities} setEntities={setEntities} updateEntity={updateEntity}
              selectedId={selectedId} setSelectedId={setSelectedId}
              haEntities={haEntities} editorSettings={editorSettings}
              setEditorSettings={setEditorSettings} paths={paths} setPaths={setPaths}
              handleImageUpload={handleImageUpload} setDrawingMode={setDrawingMode}
            />
          )}

          <Canvas 
            entities={entities} setEntities={setEntities}
            selectedId={selectedId} setSelectedId={setSelectedId}
            updateEntity={updateEntity} bgImage={bgImage}
            canvasSize={canvasSize} zoom={zoom} setZoom={setZoom}
            isPanMode={isPanMode} setIsPanMode={setIsPanMode}
            isPanning={isPanning} setIsPanning={setIsPanning}
            drawingMode={drawingMode} setDrawingMode={setDrawingMode}
            drawnPoints={drawnPoints} setDrawnPoints={setDrawnPoints}
            mousePos={mousePos} setMousePos={setMousePos}
            editorSettings={editorSettings}
            roomNamePrompt={roomNamePrompt} setRoomNamePrompt={setRoomNamePrompt}
            roomNameInput={roomNameInput} setRoomNameInput={setRoomNameInput}
            isFullscreen={isFullscreen}
          />
        </div>

        <HomeAssistantModal 
          showHAModal={showHAModal} setShowHAModal={setShowHAModal}
          haConfig={haConfig} setHaConfig={setHaConfig}
          haEntities={haEntities} setHaEntities={setHaEntities}
          haStatus={haStatus} setHaStatus={setHaStatus}
        />

        <CodeModal 
          showCode={showCode} setShowCode={setShowCode}
          activeTab={activeTab} setActiveTab={setActiveTab}
          entities={entities} paths={paths} canvasSize={canvasSize}
        />

        {roomNamePrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold mb-2">Name this Room</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Give your new room area a recognizable name.</p>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Living Room" 
                value={roomNameInput} 
                onChange={e => setRoomNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const safeId = 'room_' + (roomNameInput || 'New Room').toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    updateEntity(roomNamePrompt, { name: roomNameInput || 'New Room', roomId: safeId });
                    setRoomNamePrompt(null);
                  }
                }}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" 
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    const safeId = 'room_' + (roomNameInput || 'New Room').toLowerCase().replace(/[^a-z0-9]+/g, '_');
                    updateEntity(roomNamePrompt, { name: roomNameInput || 'New Room', roomId: safeId });
                    setRoomNamePrompt(null);
                  }} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}