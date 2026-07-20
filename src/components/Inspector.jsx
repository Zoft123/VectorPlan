import React from 'react';
import { Icons } from '../utils/icons';

export function Inspector({
  entities, setEntities, updateEntity, selectedId, haEntities,
  editorSettings, setEditorSettings, paths, setPaths,
  handleImageUpload, setDrawingMode, setSelectedId
}) {
  const selectedEntity = entities.find(e => e.id === selectedId);
  const roomsList = entities.filter(e => e.kind === 'Room');

  return (
    <div className="w-72 md:w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Icons.Upload /> Import</h2>
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-center group">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Icons.Upload />
          </div>
          <span className="font-semibold text-sm mb-1">Upload Floorplan Image</span>
          <span className="text-xs text-slate-500">JPG, PNG, or SVG</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Icons.Sun /> Editor Settings</h2>
        
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Workspace Mode</h3>
        <div className="flex gap-2 mb-6">
           <button onClick={() => {setEditorSettings(s => ({ ...s, mode: 'edit' })); setDrawingMode(false);}} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${editorSettings.mode === 'edit' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Edit Mode</button>
           <button onClick={() => {setEditorSettings(s => ({ ...s, mode: 'preview' })); setDrawingMode(false); setSelectedId(null);}} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${editorSettings.mode === 'preview' ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Preview Mode</button>
        </div>

        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Grid & Snapping</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => setEditorSettings(s => ({ ...s, snap: !s.snap }))} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${editorSettings.snap ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Snap</button>
          <button onClick={() => setEditorSettings(s => ({ ...s, grid: !s.grid }))} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${editorSettings.grid ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Grid</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">GRID SIZE</label>
            <input type="number" value={editorSettings.gridSize} onChange={e => setEditorSettings(s => ({ ...s, gridSize: parseInt(e.target.value) || 1 }))} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SNAP DISTANCE</label>
            <input type="number" value={editorSettings.snapDistance} onChange={e => setEditorSettings(s => ({ ...s, snapDistance: parseInt(e.target.value) || 1 }))} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Icons.Code /> Output Paths</h2>
        <div className="space-y-4">
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SVG PATH</label><input type="text" value={paths.svg} onChange={e => setPaths({ ...paths, svg: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-xs font-mono outline-none" /></div>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">CSS PATH</label><input type="text" value={paths.css} onChange={e => setPaths({ ...paths, css: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-xs font-mono outline-none" /></div>
          <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">OFF IMAGE HREF</label><input type="text" value={paths.offImage} onChange={e => setPaths({ ...paths, offImage: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-xs font-mono outline-none" /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden z-20 flex flex-col flex-shrink-0 min-h-[400px]">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-semibold flex items-center gap-2"><Icons.Code /> Inspector</h2>
          <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full font-semibold">{entities.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {selectedEntity ? (
            <div className="space-y-4">
             {selectedEntity.kind === 'Room' ? (
                <>
                   <div>
                     <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Name</label>
                     <input type="text" value={selectedEntity.name} onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none" />
                   </div>
                   <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Room ID</label><input type="text" value={selectedEntity.roomId} onChange={(e) => updateEntity(selectedEntity.id, { roomId: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none font-mono" /></div>
                   
                   <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Room Styling & States</h3>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50">
                       <label className="block text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> ON State (Lit)</label>
                       <div className="mb-3">
                         <label className="block text-xs text-slate-400 mb-1">Color</label>
                         <div className="flex items-center gap-2">
                            <input type="color" value={selectedEntity.fillColor || '#ffffff'} onChange={(e) => updateEntity(selectedEntity.id, { fillColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                         </div>
                       </div>
                       <div>
                         <label className="flex justify-between text-xs text-slate-400 mb-1"><span>Opacity</span><span>{selectedEntity.opacity !== undefined ? selectedEntity.opacity : 40}%</span></label>
                         <input type="range" min="0" max="100" value={selectedEntity.opacity !== undefined ? selectedEntity.opacity : 40} onChange={(e) => updateEntity(selectedEntity.id, { opacity: parseInt(e.target.value) })} className="w-full accent-blue-600" />
                       </div>
                     </div>
                     
                     <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50">
                       <label className="block text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span> OFF State (Dark)</label>
                       <div className="mb-3">
                         <label className="block text-xs text-slate-400 mb-1">Color</label>
                         <div className="flex items-center gap-2">
                            <input type="color" value={selectedEntity.offFillColor || '#000000'} onChange={(e) => updateEntity(selectedEntity.id, { offFillColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                         </div>
                       </div>
                       <div>
                         <label className="flex justify-between text-xs text-slate-400 mb-1"><span>Opacity</span><span>{selectedEntity.offOpacity !== undefined ? selectedEntity.offOpacity : 0}%</span></label>
                         <input type="range" min="0" max="100" value={selectedEntity.offOpacity !== undefined ? selectedEntity.offOpacity : 0} onChange={(e) => updateEntity(selectedEntity.id, { offOpacity: parseInt(e.target.value) })} className="w-full accent-blue-600" />
                       </div>
                     </div>
                   </div>
                </>
             ) : (
                <>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Kind</label>
                       <select value={selectedEntity.kind} onChange={(e) => updateEntity(selectedEntity.id, { kind: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none">
                         <option value="Light">Light</option><option value="Sensor">Sensor</option><option value="Camera">Camera</option><option value="Fan">Fan</option><option value="Lock">Lock</option><option value="Garage">Garage Door</option><option value="Thermostat">Thermostat</option><option value="Other">Other</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Name</label>
                       <input type="text" value={selectedEntity.name} onChange={(e) => updateEntity(selectedEntity.id, { name: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Entity ID</label>
                     {haEntities.length > 0 ? (
                       <>
                         <input list="ha-entity-list" type="text" value={selectedEntity.entityId} onChange={(e) => updateEntity(selectedEntity.id, { entityId: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none font-mono" placeholder="Select or type..." />
                         <datalist id="ha-entity-list">
                           {haEntities.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                         </datalist>
                       </>
                     ) : (
                       <input type="text" value={selectedEntity.entityId} onChange={(e) => updateEntity(selectedEntity.id, { entityId: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none font-mono" />
                     )}
                   </div>
                   
                   <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">SVG Base ID</label><input type="text" value={selectedEntity.svgId} onChange={(e) => updateEntity(selectedEntity.id, { svgId: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none font-mono" /></div>

                   <h3 className="text-xs font-bold text-slate-500 mt-6 mb-2 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-1">Position & Size</h3>
                   <div className="grid grid-cols-3 gap-2">
                     <div><label className="block text-[10px] text-slate-400 mb-1">X</label><input type="number" value={Math.round(selectedEntity.x)} onChange={(e) => updateEntity(selectedEntity.id, { x: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-1.5 text-xs text-center focus:ring-2 outline-none font-mono" /></div>
                     <div><label className="block text-[10px] text-slate-400 mb-1">Y</label><input type="number" value={Math.round(selectedEntity.y)} onChange={(e) => updateEntity(selectedEntity.id, { y: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-1.5 text-xs text-center focus:ring-2 outline-none font-mono" /></div>
                     <div><label className="block text-[10px] text-slate-400 mb-1">RADIUS</label><input type="number" value={selectedEntity.radius} onChange={(e) => updateEntity(selectedEntity.id, { radius: parseInt(e.target.value) || 10 })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-1.5 text-xs text-center focus:ring-2 outline-none font-mono" /></div>
                   </div>

                   {selectedEntity.kind === 'Fan' && (
                     <div className="mt-4">
                       <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Fan Animation & Styling</h3>
                       <div className="mb-4">
                         <label className="block text-xs text-slate-400 mb-1">Fan Color</label>
                         <div className="flex items-center gap-3">
                            <input type="color" value={selectedEntity.color || '#000000'} onChange={(e) => updateEntity(selectedEntity.id, { color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                            <span className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">{selectedEntity.color || '#000000'}</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div><label className="block text-xs text-slate-400 mb-1">SPIN SPEED</label><input type="text" placeholder="e.g., 2s" value={selectedEntity.spinSpeed || ''} onChange={(e) => updateEntity(selectedEntity.id, { spinSpeed: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" /></div>
                         <div>
                           <label className="block text-xs text-slate-400 mb-1">DIRECTION</label>
                           <select value={selectedEntity.spinDirection || 'spin-cw'} onChange={(e) => updateEntity(selectedEntity.id, { spinDirection: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono">
                             <option value="spin-cw">Clockwise</option>
                             <option value="spin-ccw">Counter-CW</option>
                           </select>
                         </div>
                       </div>
                       <div className="mb-4">
                         <label className="block text-xs text-slate-400 mb-1">CUSTOM SVG CODE (Optional)</label>
                         <textarea rows={3} placeholder='<svg viewBox="0 0 24 24"><path d="..."/></svg>' value={selectedEntity.customSVG || ''} onChange={(e) => updateEntity(selectedEntity.id, { customSVG: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" />
                       </div>
                     </div>
                   )}

                   {selectedEntity.kind === 'Lock' && (
                     <div className="mt-4">
                       <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Lock Styling</h3>
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <label className="block text-xs text-slate-400 mb-1">Unlocked Color</label>
                           <div className="flex items-center gap-2">
                              <input type="color" value={selectedEntity.unlockedColor || '#22c55e'} onChange={(e) => updateEntity(selectedEntity.id, { unlockedColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                           </div>
                         </div>
                         <div>
                           <label className="block text-xs text-slate-400 mb-1">Locked Color</label>
                           <div className="flex items-center gap-2">
                              <input type="color" value={selectedEntity.lockedColor || '#000000'} onChange={(e) => updateEntity(selectedEntity.id, { lockedColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                           </div>
                         </div>
                       </div>
                       <div className="mb-4">
                         <label className="block text-xs text-slate-400 mb-1">CUSTOM SVG CODE (Optional)</label>
                         <textarea rows={3} placeholder='<svg viewBox="0 0 24 24"><path d="..."/></svg>' value={selectedEntity.customSVG || ''} onChange={(e) => updateEntity(selectedEntity.id, { customSVG: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" />
                       </div>
                     </div>
                   )}

                   {selectedEntity.kind === 'Garage' && (
                     <div className="mt-4">
                       <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Garage Door Settings</h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400">This entity uses custom open/closed 3D SVG illustrations automatically. Simply ensure your Entity ID points to a valid HA cover entity (e.g. cover.garage_door).</p>
                     </div>
                   )}

                   {selectedEntity.kind === 'Thermostat' && (
                     <div className="mt-4">
                       <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Thermostat Display</h3>
                       <p className="text-[10px] text-slate-500 mb-4">Clicking this entity in Home Assistant opens the "More Info" dialog. It automatically pulls the 'current_temperature' attribute.</p>
                       <div className="mb-4">
                         <label className="block text-xs text-slate-400 mb-1">CUSTOM SVG CODE (Optional)</label>
                         <textarea rows={3} placeholder='<svg viewBox="0 0 24 24"><path d="..."/></svg>' value={selectedEntity.customSVG || ''} onChange={(e) => updateEntity(selectedEntity.id, { customSVG: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" />
                       </div>
                     </div>
                   )}

                   {selectedEntity.kind === 'Light' && (
                     <div className="mt-4">
                       <h3 className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">Light Effect</h3>
                       <div className="mb-4">
                         <label className="block text-xs text-slate-400 mb-1">Illumination Style</label>
                         <select value={selectedEntity.lightStyle || 'glow'} onChange={(e) => updateEntity(selectedEntity.id, { lightStyle: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none">
                           <option value="glow">Radial Glow (AoE)</option>
                           <option value="room">Room Area Mask</option>
                         </select>
                       </div>
                       {selectedEntity.lightStyle === 'room' ? (
                         <div className="mb-4">
                           <label className="block text-xs text-slate-400 mb-1">Target Room Area</label>
                           <select value={selectedEntity.targetRoomId || ''} onChange={(e) => updateEntity(selectedEntity.id, { targetRoomId: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg p-2 text-sm focus:ring-2 outline-none">
                             <option value="">Select a Room...</option>
                             {roomsList.map(r => <option key={r.id} value={r.roomId}>{r.name} ({r.roomId})</option>)}
                           </select>
                           {roomsList.length === 0 && <p className="text-[10px] text-amber-500 mt-1">No rooms drawn yet. Use "Draw Room Area" above.</p>}
                         </div>
                       ) : (
                         <>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                             <div><label className="block text-xs text-slate-400 mb-1">GLOW RX</label><input type="number" value={selectedEntity.glowRx} onChange={(e) => updateEntity(selectedEntity.id, { glowRx: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" /></div>
                             <div><label className="block text-xs text-slate-400 mb-1">GLOW RY</label><input type="number" value={selectedEntity.glowRy} onChange={(e) => updateEntity(selectedEntity.id, { glowRy: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" /></div>
                           </div>
                           <div className="mb-3"><label className="flex justify-between text-xs text-slate-400 mb-1"><span>White Intensity</span><span>{selectedEntity.whiteIntensity !== undefined ? selectedEntity.whiteIntensity : 60}%</span></label><input type="range" min="0" max="100" value={selectedEntity.whiteIntensity !== undefined ? selectedEntity.whiteIntensity : 60} onChange={(e) => updateEntity(selectedEntity.id, { whiteIntensity: parseInt(e.target.value) })} className="w-full accent-blue-600" /></div>
                           <div><label className="flex justify-between text-xs text-slate-400 mb-1"><span>Tint Intensity</span><span>{selectedEntity.tintIntensity !== undefined ? selectedEntity.tintIntensity : 50}%</span></label><input type="range" min="0" max="100" value={selectedEntity.tintIntensity !== undefined ? selectedEntity.tintIntensity : 50} onChange={(e) => updateEntity(selectedEntity.id, { tintIntensity: parseInt(e.target.value) })} className="w-full accent-blue-600" /></div>
                         </>
                       )}
                       
                       <div className="mb-4 mt-4">
                         <label className="block text-xs text-slate-400 mb-1">CUSTOM SVG CODE (Optional)</label>
                         <textarea rows={3} placeholder='<svg viewBox="0 0 24 24"><path d="..."/></svg>' value={selectedEntity.customSVG || ''} onChange={(e) => updateEntity(selectedEntity.id, { customSVG: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded p-2 text-xs focus:ring-2 outline-none font-mono" />
                       </div>
                     </div>
                   )}

                   {/* Delete Button */}
                   <div className="mt-8 pt-4 border-t border-red-100 dark:border-red-900/30">
                     <button 
                       onClick={() => {
                         setEntities(prev => prev.filter(e => e.id !== selectedEntity.id));
                         setSelectedId(null);
                       }}
                       className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg transition-colors text-sm font-semibold"
                     >
                       <Icons.Trash /> Delete {selectedEntity.kind === 'Room' ? 'Room' : 'Entity'}
                     </button>
                   </div>
                </>
             )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center space-y-3">
              <Icons.MousePointer className="w-10 h-10 opacity-20" />
              <p className="text-sm font-medium">Select an entity to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}