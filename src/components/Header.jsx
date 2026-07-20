import React from 'react';
import { Icons } from '../utils/icons';

export function Header({
  isDark, setIsDark, isFullscreen, setIsFullscreen,
  showAddMenu, setShowAddMenu, drawingMode, setDrawingMode,
  setIsPanMode, setShowHAModal, setShowCode, addEntity, haStatus, dropdownRef
}) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between z-40 shadow-sm flex-shrink-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <img src="./vectorplan.png" alt="VectorPlan" className="w-8 h-8 object-contain" />
          VectorPlan Editor
        </h1>
        {!isFullscreen && <p className="text-sm text-slate-500 dark:text-slate-400">Visual editor for Home Assistant Floorplans</p>}
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowHAModal(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-semibold ${haStatus.connected ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          title="Connect to Home Assistant"
        >
          {haStatus.connected ? <Icons.Server /> : <Icons.Link />}
          <span className="hidden md:inline">{haStatus.connected ? 'HA Connected' : 'Link to HA'}</span>
        </button>

        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-semibold ${isFullscreen ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          title="Toggle Full Webpage Mode"
        >
          {isFullscreen ? <Icons.Minimize /> : <Icons.Maximize />}
          <span className="hidden md:inline">{isFullscreen ? 'Exit Full Webpage' : 'Full Webpage'}</span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
          {isDark ? <Icons.Sun /> : <Icons.Moon />}
        </button>
        
        <button 
          onClick={() => { setDrawingMode(true); setIsPanMode(false); setShowAddMenu(false); }}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm transition-colors text-sm font-semibold ${drawingMode ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <Icons.Pen /> Draw Room Area
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => { setShowAddMenu(!showAddMenu); setDrawingMode(false); setIsPanMode(false); }} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
            <Icons.Upload /> Add Entity <Icons.ChevronDown />
          </button>
          
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Entities</div>
              <button onClick={() => addEntity('Light')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-yellow-500"><Icons.Light /></div> <span>Light</span></button>
              <button onClick={() => addEntity('Fan')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-blue-500"><Icons.Fan /></div> <span>Fan</span></button>
              <button onClick={() => addEntity('Lock')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-red-500"><Icons.Lock /></div> <span>Lock</span></button>
              <button onClick={() => addEntity('Outlet')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-teal-500"><Icons.Outlet /></div> <span>Outlet</span></button>
              <button onClick={() => addEntity('Garage')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-stone-500"><Icons.Garage /></div> <span>Garage Door</span></button>
              <button onClick={() => addEntity('Thermostat')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-orange-500"><Icons.Thermostat /></div> <span>Thermostat</span></button>
              <button onClick={() => addEntity('Sensor')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-green-500"><Icons.Sensor /></div> <span>Sensor</span></button>
              <button onClick={() => addEntity('Camera')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-purple-500"><Icons.Camera /></div> <span>Camera</span></button>
              <button onClick={() => addEntity('Other')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-slate-500"><Icons.Sensor /></div> <span>Other</span></button>
              
              <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
              <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Structural</div>
              <button onClick={() => addEntity('Door')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-blue-500"><Icons.Door /></div> <span>Door</span></button>
              <button onClick={() => addEntity('Window')} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="text-cyan-500"><Icons.Window /></div> <span>Window</span></button>
            </div>
          )}
        </div>

        <button onClick={() => setShowCode(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors text-sm font-semibold">
          <Icons.Code /> Generate Code
        </button>
      </div>
    </header>
  );
}
