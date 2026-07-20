import React, { useRef } from 'react';
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
      if (drawnPoints.length > 2) {
        const firstPoint = drawnPoints[0];
        const dist = Math.hypot(firstPoint.x - x, firstPoint.y - y);
        if (dist < (20 / zoom)) {
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
      setDrawnPoints([...drawnPoints, { x, y }]);
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

    if (drawingMode) {
      setMousePos({ x, y });
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

  let cursorClass = '';
  if (isPanMode || isPanning) cursorClass = isPanning ? 'cursor-grabbing' : 'cursor-grab';
  else if (drawingMode) cursorClass = 'cursor-crosshair';

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
             {editorSettings.grid && (
               <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`, backgroundSize: `${editorSettings.gridSize}px ${editorSettings.gridSize}px` }}></div>
             )}

             <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
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

               {entities.filter(e => ['Door', 'Window'].includes(e.kind)).map(ent => {
                 const isSelected = selectedId === ent.id;
                 return (
                   <g 
                     key={ent.id}
                     transform={`translate(${ent.x}, ${ent.y}) rotate(${ent.angle})`}
                     className={(editorSettings.mode === 'edit' && !isPanMode && !isPanning) ? 'pointer-events-auto cursor-move' : ''}
                     onPointerDown={(e) => {
                       if (editorSettings.mode === 'edit') handleEntityPointerDown(e, ent);
                     }}
                   >
                     {ent.kind === 'Window' && (
                       <>
                         <rect x={-ent.width/2} y={-ent.depth/2} width={ent.width} height={ent.depth} fill="#f8fafc" stroke={ent.color} strokeWidth="2" />
                         <line x1={-ent.width/2} y1={0} x2={ent.width/2} y2={0} stroke={ent.color} strokeWidth="1" />
                       </>
                     )}
                     
                     {ent.kind === 'Door' && (
                       <>
                         <line x1={-ent.width/2} y1={-ent.depth/2} x2={-ent.width/2} y2={ent.depth/2} stroke={ent.color} strokeWidth="2" />
                         <line x1={ent.width/2} y1={-ent.depth/2} x2={ent.width/2} y2={ent.depth/2} stroke={ent.color} strokeWidth="2" />
                         <line x1={-ent.width/2} y1={0} x2={ent.width/2} y2={0} stroke={ent.color} strokeWidth="1" strokeDasharray="4 4" />
                         <line x1={-ent.width/2} y1={0} x2={-ent.width/2} y2={ent.flip ? ent.width : -ent.width} stroke={ent.color} strokeWidth="3" strokeLinecap="round" />
                         <path d={`M ${-ent.width/2},${ent.flip ? ent.width : -ent.width} A ${ent.width} ${ent.width} 0 0 ${ent.flip ? 0 : 1} ${ent.width/2},0`} fill="none" stroke={ent.color} strokeWidth="1" />
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
                       <rect 
                         x={-ent.width/2 - 5} 
                         y={ent.kind === 'Door' ? (ent.flip ? -5 : -ent.width - 5) : -ent.depth/2 - 5} 
                         width={ent.width + 10} 
                         height={ent.kind === 'Door' ? ent.width + 10 : ent.depth + 10} 
                         fill="rgba(59, 130, 246, 0.1)" 
                         stroke="#3b82f6" 
                         strokeWidth="1" 
                         strokeDasharray="3 3" 
                       />
                     )}
                   </g>
                 );
               })}

               {drawingMode && drawnPoints.length > 0 && (
                 <>
                    <polygon points={drawnPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(59, 130, 246, 0.2)" stroke="transparent" />
                    <polyline points={drawnPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1={drawnPoints[drawnPoints.length-1].x} y1={drawnPoints[drawnPoints.length-1].y} x2={mousePos.x} y2={mousePos.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                    {drawnPoints.map((p, i) => (
                       <circle key={i} cx={p.x} cy={p.y} r={5/zoom} fill={i === 0 ? "#ef4444" : "#3b82f6"} stroke="#fff" strokeWidth={1/zoom} className="transition-all" />
                    ))}
                 </>
               )}
             </svg>

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