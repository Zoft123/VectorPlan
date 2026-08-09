import React, { useRef, useState } from 'react';
import { Icons } from '../utils/icons';

export function Canvas({
  entities, setEntities, selectedId, setSelectedId, updateEntity,
  bgImage, canvasSize, zoom, setZoom,
  isPanMode, setIsPanMode, isPanning, setIsPanning,
  drawingMode, setDrawingMode, drawnPoints, setDrawnPoints,
  mousePos, setMousePos, editorSettings,
  roomNamePrompt, setRoomNamePrompt, roomNameInput, setRoomNameInput,
  isFullscreen
}) {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, id: null, offsetX: 0, offsetY: 0 });
  const panRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  
  // Track rotation state
  const [isRotating, setIsRotating] = useState(false);
  const rotateRef = useRef({ isRotating: false, id: null, startAngle: 0, startEntityAngle: 0 });

  // Track resizing state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({ isResizing: false, id: null, type: null });

  const handlePointerDownCanvas = (e) => {
    if (e.button === 1 || isPanMode) {
      e.preventDefault();
      setIsPanning(true);
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: scrollContainerRef.current.scrollLeft,
        scrollTop: scrollContainerRef.current.scrollTop
      };
      return;
    }
    
    if (editorSettings.mode !== 'edit' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    if (drawingMode) {
      let isClosing = false;
      if (drawnPoints.length > 2) {
        const firstPoint = drawnPoints[0];
        const dist = Math.hypot(firstPoint.x - x, firstPoint.y - y);
        if (dist < (20 / zoom)) {
          isClosing = true;
          const id = Date.now();
          setEntities([...entities, {
            id, kind: 'Room', name: 'New Room Area', roomId: `room_${id}`, points: [...drawnPoints], fillColor: '#ffffff', opacity: 40, offFillColor: '#000000', offOpacity: 0, blendMode: 'screen'
          }]);
          setDrawnPoints([]);
          setDrawingMode(false);
          setSelectedId(id);
          setRoomNamePrompt(id);
          setRoomNameInput('');
          return;
        }
      }
      
      let currX = x;
      let currY = y;

      if (editorSettings.snapAngles && drawnPoints.length > 1 && !isClosing) {
        const p1 = drawnPoints[drawnPoints.length - 1];
        const p0 = drawnPoints[drawnPoints.length - 2];
        const baseAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        
        let currentAngle = Math.atan2(y - p1.y, x - p1.x);
        let dist = Math.hypot(y - p1.y, x - p1.x);
        let relAngle = currentAngle - baseAngle;
        relAngle = Math.atan2(Math.sin(relAngle), Math.cos(relAngle));
        const snapInterval = Math.PI / 2;
        const snappedRel = Math.round(relAngle / snapInterval) * snapInterval;
        currentAngle = baseAngle + snappedRel;
        currX = Math.round(p1.x + Math.cos(currentAngle) * dist);
        currY = Math.round(p1.y + Math.sin(currentAngle) * dist);
      }
      
      setDrawnPoints([...drawnPoints, { x: currX, y: currY }]);
    } else {
      setSelectedId(null);
    }
  };

  const handlePointerMoveCanvas = (e) => {
    if (isPanning) {
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;
      if(scrollContainerRef.current) {
         scrollContainerRef.current.scrollLeft = panRef.current.scrollLeft - dx;
         scrollContainerRef.current.scrollTop = panRef.current.scrollTop - dy;
      }
      return;
    }

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Handle Rotation
    if (rotateRef.current.isRotating) {
      const rotEnt = entities.find(ent => ent.id === rotateRef.current.id);
      if (rotEnt) {
        const angleToCenter = Math.atan2(y - rotEnt.y, x - rotEnt.x);
        let angleDiff = angleToCenter - rotateRef.current.startAngle;
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        
        let newAngle = rotateRef.current.startEntityAngle + (angleDiff * (180 / Math.PI));
        
        if (editorSettings.snapAngles) {
            newAngle = Math.round(newAngle / 15) * 15;
        } else {
            newAngle = Math.round(newAngle);
        }
        newAngle = (newAngle % 360 + 360) % 360;

        setEntities(prev => prev.map(ent => 
          ent.id === rotEnt.id ? { ...ent, angle: newAngle } : ent
        ));
      }
      return;
    }

    // Handle Resizing
    if (resizeRef.current.isResizing) {
      const resEnt = entities.find(ent => ent.id === resizeRef.current.id);
      if (resEnt) {
        const dx = x - resEnt.x;
        const dy = y - resEnt.y;
        
        // Convert mouse movement to the entity's local rotated coordinate space
        const angleRad = -(resEnt.angle || 0) * (Math.PI / 180);
        const localX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const localY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
        
        if (resizeRef.current.type === 'width') {
          let newWidth = Math.max(10, Math.abs(localX) * 2);
          if (editorSettings.snap) {
             const snap = editorSettings.gridSize;
             newWidth = Math.round(newWidth / snap) * snap;
             newWidth = Math.max(snap, newWidth);
          }
          setEntities(prev => prev.map(ent => ent.id === resEnt.id ? { ...ent, width: newWidth } : ent));
        } else if (resizeRef.current.type === 'depth') {
          let newDepth = Math.max(2, Math.abs(localY) * 2);
          if (editorSettings.snap) {
             const snap = editorSettings.gridSize;
             newDepth = Math.round(newDepth / snap) * snap;
             newDepth = Math.max(2, newDepth); // Never let depth drop to 0
          }
          setEntities(prev => prev.map(ent => ent.id === resEnt.id ? { ...ent, depth: newDepth } : ent));
        }
      }
      return;
    }

    if (drawingMode) {
      let dx = Math.round(x);
      let dy = Math.round(y);
      let isClosing = false;
      
      if (drawnPoints.length > 2) {
        const firstPoint = drawnPoints[0];
        if (Math.hypot(firstPoint.x - dx, firstPoint.y - dy) < (20 / zoom)) {
          isClosing = true;
          dx = firstPoint.x;
          dy = firstPoint.y;
        }
      }

      if (editorSettings.snapAngles && drawnPoints.length > 1 && !isClosing) {
        const p1 = drawnPoints[drawnPoints.length - 1];
        const p0 = drawnPoints[drawnPoints.length - 2];
        const baseAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        
        let currentAngle = Math.atan2(dy - p1.y, dx - p1.x);
        let dist = Math.hypot(dy - p1.y, dx - p1.x);
        let relAngle = currentAngle - baseAngle;
        relAngle = Math.atan2(Math.sin(relAngle), Math.cos(relAngle));
        const snapInterval = Math.PI / 2;
        const snappedRel = Math.round(relAngle / snapInterval) * snapInterval;
        currentAngle = baseAngle + snappedRel;
        dx = p1.x + Math.cos(currentAngle) * dist;
        dy = p1.y + Math.sin(currentAngle) * dist;
      }
      setMousePos({ x: dx, y: dy });
    }

    if (dragRef.current.isDragging) {
      let newX = x - dragRef.current.offsetX;
      let newY = y - dragRef.current.offsetY;

      if (editorSettings.snap) {
        const snap = editorSettings.gridSize;
        newX = Math.round(newX / snap) * snap;
        newY = Math.round(newY / snap) * snap;
      } else {
        newX = Math.round(newX);
        newY = Math.round(newY);
      }
      
      setEntities(prev => prev.map(ent => 
        ent.id === dragRef.current.id ? { ...ent, x: newX, y: newY } : ent
      ));
    }
  };

  const handlePointerUpCanvas = () => {
    dragRef.current.isDragging = false;
    setIsPanning(false);
    if (isRotating) setIsRotating(false);
    rotateRef.current.isRotating = false;
    if (isResizing) setIsResizing(false);
    resizeRef.current.isResizing = false;
  };

  const handleEntityPointerDown = (e, entity) => {
    if (isPanMode || e.button === 1) return; 
    
    if (editorSettings.mode === 'preview') {
      e.stopPropagation();
      updateEntity(entity.id, { isOn: !entity.isOn });
      return;
    }
    if (drawingMode) return;
    
    e.stopPropagation();
    setSelectedId(entity.id);
    
    if(!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    dragRef.current = {
      isDragging: true,
      id: entity.id,
      offsetX: ((e.clientX - rect.left) / zoom) - entity.x,
      offsetY: ((e.clientY - rect.top) / zoom) - entity.y,
    };
  };

  const handleRotatePointerDown = (e, entity) => {
    e.stopPropagation();
    if(!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setIsRotating(true);
    rotateRef.current = {
      isRotating: true,
      id: entity.id,
      startAngle: Math.atan2(y - entity.y, x - entity.x),
      startEntityAngle: entity.angle || 0
    };
  };

  const handleResizePointerDown = (e, entity, type) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      isResizing: true,
      id: entity.id,
      type: type
    };
  };

  let cursorClass = '';
  if (isPanMode || isPanning) cursorClass = isPanning ? 'cursor-grabbing' : 'cursor-grab';
  else if (drawingMode) cursorClass = 'cursor-crosshair';
  else if (isRotating) cursorClass = 'cursor-grabbing';
  else if (isResizing) cursorClass = 'cursor-crosshair';

  let currentAngleText = '';
  if (drawingMode && drawnPoints.length > 0) {
    if (drawnPoints.length === 1) {
      let a = Math.atan2(mousePos.y - drawnPoints[0].y, mousePos.x - drawnPoints[0].x) * (180 / Math.PI);
      if (a < 0) a += 360;
      currentAngleText = `${Math.round(a)}°`;
    } else {
      const p1 = drawnPoints[drawnPoints.length - 1];
      const p0 = drawnPoints[drawnPoints.length - 2];
      const a1 = Math.atan2(p0.y - p1.y, p0.x - p1.x);
      const a2 = Math.atan2(mousePos.y - p1.y, mousePos.x - p1.x);
      let diff = Math.abs((a1 - a2) * (180 / Math.PI));
      if (diff > 180) diff = 360 - diff;
      currentAngleText = `${Math.round(diff)}°`;
    }
  }

  return (
    <div className="flex-1 bg-slate-200 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col overflow-hidden relative">
      
      {!isFullscreen && (
        <div className="flex-shrink-0 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-sm px-4 py-3 border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold flex items-center gap-2"><Icons.Light /> Canvas View</span>
            {drawingMode && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2 py-1 rounded animate-pulse">Click canvas to drop points. Click your original starting point (the red dot) to complete the room.</span>}
            {isPanMode && <span className="text-xs px-2 py-1 text-slate-500">Pan Mode Active (Middle click to pan anytime)</span>}
          </div>
          <span className="text-xs text-slate-500 font-mono">Original Size: {canvasSize.width} × {canvasSize.height}</span>
        </div>
      )}

      <div className="absolute bottom-6 right-6 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl overflow-hidden z-20 pointer-events-auto">
         <button onClick={() => {setIsPanMode(false); setDrawingMode(false);}} className={`p-2.5 transition-colors ${!isPanMode && !drawingMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`} title="Cursor Tool"><Icons.MousePointer /></button>
         <button onClick={() => {setIsPanMode(true); setDrawingMode(false);}} className={`p-2.5 border-r border-slate-200 dark:border-slate-700 transition-colors ${isPanMode ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`} title="Pan Tool (or Middle Click)"><Icons.Hand /></button>
         
         <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors ml-1"><Icons.ZoomOut /></button>
         <span className="text-xs font-mono w-14 text-center text-slate-800 dark:text-slate-200 font-semibold">{Math.round(zoom * 100)}%</span>
         <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"><Icons.ZoomIn /></button>
      </div>

      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 relative ${cursorClass}`}
        onPointerDown={handlePointerDownCanvas}
        onPointerMove={handlePointerMoveCanvas}
        onPointerUp={handlePointerUpCanvas}
        onPointerLeave={handlePointerUpCanvas}
      >
         <div style={{ width: (canvasSize.width * zoom) + 120, height: (canvasSize.height * zoom) + 120, minWidth: '100%', minHeight: '100%', position: 'relative' }}>
           
           <div 
             ref={canvasRef}
             className="absolute shadow-xl touch-none flex-shrink-0 bg-slate-800"
             style={{ 
               top: 60,
               left: 60,
               transform: `scale(${zoom})`,
               transformOrigin: 'top left',
               width: canvasSize.width, 
               height: canvasSize.height,
               backgroundImage: bgImage ? `url(${bgImage})` : 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)',
               backgroundSize: '100% 100%',
               backgroundPosition: 'top left',
               backgroundRepeat: 'no-repeat',
             }}
           >
             <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
               {/* Native SVG pattern for perfect grid rendering */}
               {editorSettings.grid && (
                 <>
                   <defs>
                     <pattern id="canvas-grid" width={editorSettings.gridSize} height={editorSettings.gridSize} patternUnits="userSpaceOnUse">
                       <path d={`M ${editorSettings.gridSize} 0 L 0 0 0 ${editorSettings.gridSize}`} fill="none" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="0.5"/>
                     </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#canvas-grid)" />
                 </>
               )}

               {/* ROOMS */}
               {entities.filter(e => e.kind === 'Room').map(room => {
                  const isSelected = selectedId === room.id;
                  const isLit = editorSettings.mode === 'preview' && entities.some(l => l.kind === 'Light' && l.lightStyle === 'room' && l.targetRoomId === room.roomId && l.isOn);
                  const mappedLight = entities.find(l => l.kind === 'Light' && l.lightStyle === 'room' && l.targetRoomId === room.roomId);
                  
                  const currentFill = isLit ? (room.fillColor || '#ffffff') : (room.offFillColor || '#000000');
                  const currentOpacity = isLit ? ((room.opacity ?? 40) / 100) : ((room.offOpacity ?? 0) / 100);

                  return (
                    <polygon
                      key={room.id}
                      points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
                      fill={editorSettings.mode === 'edit' && isSelected ? (room.fillColor || '#ffffff') : currentFill}
                      fillOpacity={editorSettings.mode === 'edit' ? (isSelected ? 0.3 : 0.1) : currentOpacity}
                      stroke={editorSettings.mode === 'edit' ? (isSelected ? "#3b82f6" : "rgba(255,255,255,0.4)") : "transparent"}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={editorSettings.mode === 'edit' && !isSelected ? "4,4" : "none"}
                      style={{ mixBlendMode: room.blendMode || 'screen' }}
                      className={(editorSettings.mode === 'edit' && !isPanMode && !isPanning) ? 'pointer-events-auto cursor-move' : (editorSettings.mode === 'preview' && mappedLight && !isPanMode ? 'pointer-events-auto cursor-pointer' : '')}
                      onPointerDown={(e) => {
                         if (isPanMode || e.button === 1) return;
                         
                         if (editorSettings.mode === 'edit' && !drawingMode) {
                           e.stopPropagation();
                           setSelectedId(room.id);
                           if(canvasRef.current) {
                              const rect = canvasRef.current.getBoundingClientRect();
                              dragRef.current = {
                                 isDragging: true, id: room.id,
                                 offsetX: ((e.clientX - rect.left) / zoom) - room.points[0].x,
                                 offsetY: ((e.clientY - rect.top) / zoom) - room.points[0].y,
                              };
                           }
                         } else if (editorSettings.mode === 'preview' && mappedLight) {
                           e.stopPropagation();
                           updateEntity(mappedLight.id, { isOn: !mappedLight.isOn });
                         }
                      }}
                    />
                  )
               })}

               {/* STRUCTURAL ELEMENTS (Doors/Windows) */}
               {entities.filter(e => ['Door', 'Window'].includes(e.kind)).map(ent => {
                 const isSelected = selectedId === ent.id;
                 return (
                   <g 
                     key={ent.id}
                     transform={`translate(${ent.x}, ${ent.y}) rotate(${ent.angle})`}
                     className={(editorSettings.mode === 'edit' && !isPanMode && !isPanning) ? 'pointer-events-auto cursor-move' : (editorSettings.mode === 'preview' && ent.entityId && !isPanMode ? 'pointer-events-auto cursor-pointer' : '')}
                     onPointerDown={(e) => {
                       if (!isRotating && !isResizing) handleEntityPointerDown(e, ent);
                     }}
                   >
                     {ent.kind === 'Window' && (
                       <>
                         <rect x={-ent.width/2} y={-ent.depth/2} width={ent.width} height={ent.depth} fill="rgba(56, 189, 248, 0.15)" stroke={ent.color} strokeWidth="2" />
                         <g style={{ 
                             transform: (editorSettings.mode === 'preview' && ent.isOn) ? `translateX(${ent.width * 0.45}px)` : 'translateX(0px)', 
                             transition: 'transform 0.5s ease' 
                         }}>
                           <line x1={-ent.width/2} y1="-1.5" x2={ent.width/2} y2="-1.5" stroke="#38bdf8" strokeWidth="2" />
                           <line x1={-ent.width/2} y1="1.5" x2={ent.width/2} y2="1.5" stroke="#38bdf8" strokeWidth="2" />
                         </g>
                       </>
                     )}
                     
                     {ent.kind === 'Door' && (
                       <>
                         <line x1={-ent.width/2} y1={-ent.depth/2} x2={-ent.width/2} y2={ent.depth/2} stroke={ent.color} strokeWidth="2" />
                         <line x1={ent.width/2} y1={-ent.depth/2} x2={ent.width/2} y2={ent.depth/2} stroke={ent.color} strokeWidth="2" />
                         <line x1={-ent.width/2} y1={0} x2={ent.width/2} y2={0} stroke={ent.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
                         <g style={{ 
                           transformOrigin: `${-ent.width/2}px 0px`, 
                           transform: (editorSettings.mode === 'preview' && !ent.isOn) ? `rotate(${ent.flip ? -90 : 90}deg)` : 'rotate(0deg)',
                           transition: 'transform 0.5s ease'
                         }}>
                           <line x1={-ent.width/2} y1="0" x2={-ent.width/2} y2={ent.flip ? ent.width : -ent.width} stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                           <path d={`M ${-ent.width/2},${ent.flip ? ent.width : -ent.width} A ${ent.width} ${ent.width} 0 0 ${ent.flip ? 0 : 1} ${ent.width/2},0`} fill="none" stroke={ent.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.6" style={{ opacity: (editorSettings.mode === 'preview' && !ent.isOn) ? 0 : 0.6, transition: 'opacity 0.3s ease' }} />
                         </g>
                       </>
                     )}
                     
                     <rect 
                       x={-ent.width/2} 
                       y={ent.kind === 'Door' ? (ent.flip ? 0 : -ent.width) : -ent.depth/2} 
                       width={ent.width} 
                       height={ent.kind === 'Door' ? ent.width : ent.depth} 
                       fill="transparent" 
                     />

                     {isSelected && editorSettings.mode === 'edit' && (
                       <>
                         <rect 
                           x={-ent.width/2 - 5} 
                           y={ent.kind === 'Door' ? (ent.flip ? -5 : -ent.width - 5) : -ent.depth/2 - 5} 
                           width={ent.width + 10} 
                           height={ent.kind === 'Door' ? ent.width + 10 : ent.depth + 10} 
                           fill="rgba(59, 130, 246, 0.1)" 
                           stroke="#3b82f6" 
                           strokeWidth="1" 
                           strokeDasharray="3 3" 
                           pointerEvents="none"
                         />
                         
                         {/* Rotation Handle */}
                         <g className="cursor-grab hover:opacity-80 transition-opacity" onPointerDown={(e) => handleRotatePointerDown(e, ent)}>
                           <line x1={ent.width/2 + 8} y1="0" x2={ent.width/2 + 28} y2="0" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                           <circle cx={ent.width/2 + 28} cy="0" r="6" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
                           <circle cx={ent.width/2 + 28} cy="0" r="2" fill="#3b82f6" pointerEvents="none" />
                         </g>

                         {/* Width (Opening Size) Resize Handle */}
                         <g className="cursor-ew-resize hover:opacity-80 transition-opacity" onPointerDown={(e) => handleResizePointerDown(e, ent, 'width')}>
                           <rect x={ent.width/2 - 4} y={-4} width="8" height="8" fill="#fff" stroke="#10b981" strokeWidth="2" />
                         </g>

                         {/* Depth (Wall Thickness) Resize Handle */}
                         <g className="cursor-ns-resize hover:opacity-80 transition-opacity" onPointerDown={(e) => handleResizePointerDown(e, ent, 'depth')}>
                           <rect x={-4} y={ent.depth/2 - 4} width="8" height="8" fill="#fff" stroke="#8b5cf6" strokeWidth="2" />
                         </g>
                       </>
                     )}
                   </g>
                 );
               })}

               {/* DRAWING MODE OVERLAYS */}
               {drawingMode && drawnPoints.length > 0 && (
                 <>
                    <polygon points={drawnPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(59, 130, 246, 0.2)" stroke="transparent" />
                    <polyline points={drawnPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1={drawnPoints[drawnPoints.length-1].x} y1={drawnPoints[drawnPoints.length-1].y} x2={mousePos.x} y2={mousePos.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                    {drawnPoints.map((p, i) => (
                       <circle key={i} cx={p.x} cy={p.y} r={5/zoom} fill={i === 0 ? "#ef4444" : "#3b82f6"} stroke="#fff" strokeWidth={1/zoom} className="transition-all" />
                    ))}
                    <text 
                      x={mousePos.x + 15/zoom} 
                      y={mousePos.y - 15/zoom} 
                      fill="#2563eb" 
                      fontSize={14/zoom} 
                      fontWeight="bold" 
                      style={{ pointerEvents: 'none', textShadow: '1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff' }}
                    >
                      {currentAngleText}
                    </text>
                 </>
               )}
             </svg>

             {/* STANDARD ENTITIES */}
             {entities.filter(e => !['Room', 'Door', 'Window'].includes(e.kind)).map(entity => {
               const EntityIconCmp = Icons[entity.kind] || Icons.Sensor;
               return (
                <div
                  key={entity.id}
                  onPointerDown={(e) => handleEntityPointerDown(e, entity)}
                  className={`absolute ${editorSettings.mode === 'edit' ? (!drawingMode && !isPanMode ? 'cursor-move' : '') : (isPanMode ? '' : 'cursor-pointer')} ${drawingMode || isPanMode ? 'pointer-events-none' : ''}`}
                  style={{
                    left: entity.x, top: entity.y,
                    width: entity.radius * 2, height: entity.radius * 2,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {editorSettings.mode === 'edit' && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full shadow transition-all backdrop-blur-sm ${selectedId === entity.id ? 'bg-blue-600/60 border-2 border-blue-300 z-50' : 'bg-slate-900/70 border border-white/50 hover:bg-slate-900/90 z-40'}`}>
                       <EntityIconCmp className="text-white w-1/2 h-1/2" />
                       <span className="absolute top-full mt-2 text-[10px] whitespace-nowrap text-white bg-black/90 px-2 py-1 rounded shadow-xl pointer-events-none font-medium" style={{transform: `scale(${1/zoom})`, transformOrigin: 'top center'}}>{entity.name}</span>
                    </div>
                  )}
                  
                  {entity.kind === 'Light' && entity.lightStyle !== 'room' && (editorSettings.mode === 'preview' ? entity.isOn : true) && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"
                      style={{
                        width: entity.glowRx * 2, height: entity.glowRy * 2,
                        background: `radial-gradient(ellipse at center, rgba(255,255,255,${(entity.whiteIntensity || 60)/100}) 0%, rgba(255,214,120,${(entity.tintIntensity || 50)/100}) 40%, rgba(0,0,0,0) 70%)`,
                        filter: `blur(${10/zoom}px)`, zIndex: 0
                      }}
                    />
                  )}
                  
                  {editorSettings.mode === 'preview' && entity.kind === 'Light' && entity.customSVG && (
                    <div className={`absolute inset-0 pointer-events-none z-10 flex items-center justify-center transition-opacity duration-300 drop-shadow-md ${entity.isOn ? 'opacity-100' : 'opacity-50'}`}>
                       <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: entity.customSVG }} />
                    </div>
                  )}

                  {editorSettings.mode === 'preview' && entity.kind === 'Fan' && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center drop-shadow-md" style={{ color: entity.color || '#000000' }}>
                       <div className="w-full h-full flex items-center justify-center"
                         style={{ animationName: entity.isOn ? (entity.spinDirection === 'spin-ccw' ? 'spin-ccw-anim' : 'spin-cw-anim') : 'none', animationDuration: entity.spinSpeed || '2s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
                       >
                         {entity.customSVG ? <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: entity.customSVG }} /> : <Icons.Fan className="w-full h-full" />}
                       </div>
                    </div>
                  )}

                  {editorSettings.mode === 'preview' && entity.kind === 'Outlet' && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center transition-colors duration-300 drop-shadow-md" style={{ color: entity.isOn ? (entity.onColor || '#22c55e') : (entity.offColor || '#94a3b8') }}>
                       {entity.customSVG ? <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: entity.customSVG }} /> : <Icons.Outlet className="w-3/4 h-3/4" />}
                    </div>
                  )}

                  {editorSettings.mode === 'preview' && entity.kind === 'Lock' && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center transition-colors duration-300 drop-shadow-md" style={{ color: entity.isOn ? (entity.unlockedColor || '#22c55e') : (entity.lockedColor || '#000000') }}>
                       {entity.customSVG ? <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: entity.customSVG }} /> : <Icons.Lock className="w-3/4 h-3/4" />}
                    </div>
                  )}

                  {editorSettings.mode === 'preview' && entity.kind === 'Thermostat' && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center transition-colors duration-300 drop-shadow-md" style={{ color: entity.isOn ? '#ef4444' : '#000000' }}>
                       <div className="w-1/2 h-1/2 flex items-center justify-center">
                          {entity.customSVG ? <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current" dangerouslySetInnerHTML={{ __html: entity.customSVG }} /> : <Icons.Thermostat className="w-full h-full" />}
                       </div>
                       <span className="text-[11px] font-bold mt-1" style={{ transform: `scale(${1/zoom})` }}>72°</span>
                    </div>
                  )}

                  {entity.kind === 'Garage' && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center drop-shadow-md">
                      <div className="w-full h-full flex items-center justify-center transition-all duration-300">
                        {(!entity.isOn || editorSettings.mode === 'edit') ? (
                          <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <path d="M 10 90 L 10 35 L 50 15 L 90 35 L 90 90 Z" fill="none" stroke="#003855" strokeWidth="3" strokeLinejoin="round" />
                            <rect x="22" y="42" width="56" height="48" fill="none" stroke="#003855" strokeWidth="2.5" strokeLinejoin="round" />
                            <line x1="22" y1="54" x2="78" y2="54" stroke="#003855" strokeWidth="2" />
                            <line x1="22" y1="66" x2="78" y2="66" stroke="#003855" strokeWidth="2" />
                            <line x1="22" y1="78" x2="78" y2="78" stroke="#003855" strokeWidth="2" />
                            <rect x="27" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round" />
                            <rect x="44" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round" />
                            <rect x="61" y="45" width="12" height="6" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 100 100" width="100%" height="100%">
                            <path d="M 10 90 L 10 35 L 50 15 L 90 35 L 90 90 Z" fill="white" stroke="#003855" strokeWidth="3" strokeLinejoin="round" />
                            <rect x="28" y="45" width="44" height="35" fill="#0A2D42" stroke="#003855" strokeWidth="2" />
                            <line x1="22" y1="90" x2="28" y2="80" stroke="#003855" strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="78" y1="90" x2="72" y2="80" stroke="#003855" strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="28" y1="80" x2="72" y2="80" stroke="#003855" strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="28" y1="42" x2="28" y2="80" stroke="#003855" strokeWidth="2.5"/>
                            <line x1="72" y1="42" x2="72" y2="80" stroke="#003855" strokeWidth="2.5"/>
                            <rect x="22" y="42" width="56" height="48" fill="none" stroke="#003855" strokeWidth="2.5" strokeLinejoin="round" />
                            <line x1="25.5" y1="58" x2="25.5" y2="90" stroke="#003855" strokeWidth="1.5" />
                            <line x1="74.5" y1="58" x2="74.5" y2="90" stroke="#003855" strokeWidth="1.5" />
                            <polygon points="26,43 74,43 78,48 22,48" fill="white" stroke="#003855" strokeWidth="2" strokeLinejoin="round"/>
                            <polygon points="29,44.5 41,44.5 42,47 26,47" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="44,44.5 56,44.5 56,47 44,47" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="59,44.5 71,44.5 74,47 58,47" fill="#1C5D82" stroke="#003855" strokeWidth="1.5" strokeLinejoin="round"/>
                            <polygon points="22,48 78,48 81,52 19,52" fill="white" stroke="#003855" strokeWidth="2" strokeLinejoin="round"/>
                            <polygon points="19,52 81,52 83,56 17,56" fill="white" stroke="#003855" strokeWidth="2" strokeLinejoin="round"/>
                            <polygon points="17,56 83,56 83,60 17,60" fill="white" stroke="#003855" strokeWidth="2" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
             )})}
           </div>
         </div>
      </div>
    </div>
  );
}