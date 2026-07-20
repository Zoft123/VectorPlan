import React from 'react';
import { Icons } from '../utils/icons';
import { generateYaml, generateSvg, generateCss } from '../utils/generators';

export function CodeModal({
  showCode, setShowCode, activeTab, setActiveTab,
  entities, paths, canvasSize
}) {
  if (!showCode) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Code /> Generated Code</h3>
          <button onClick={() => setShowCode(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"><Icons.Close /></button>
        </div>
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2 pt-2 gap-2">
          <button onClick={() => setActiveTab('yaml')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === 'yaml' ? 'bg-white dark:bg-slate-900 border-t border-l border-r border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>YAML Config</button>
          <button onClick={() => setActiveTab('svg')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === 'svg' ? 'bg-white dark:bg-slate-900 border-t border-l border-r border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>SVG Layer</button>
          <button onClick={() => setActiveTab('css')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === 'css' ? 'bg-white dark:bg-slate-900 border-t border-l border-r border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>CSS Styles</button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-900 p-6 relative group text-left">
          <button 
            onClick={() => {
              const txt = activeTab === 'yaml' ? generateYaml(entities, paths) : (activeTab === 'svg' ? generateSvg(entities, paths, canvasSize) : generateCss(entities));
              navigator.clipboard.writeText(txt);
            }} 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-semibold backdrop-blur"
          >
            <Icons.Copy /> Copy
          </button>
          <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap break-all">
            <code>
              {activeTab === 'yaml' && generateYaml(entities, paths)}
              {activeTab === 'svg' && generateSvg(entities, paths, canvasSize)}
              {activeTab === 'css' && generateCss(entities)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}