import React from 'react';
import { Icons } from '../utils/icons';

export function HomeAssistantModal({
  showHAModal, setShowHAModal, haConfig, setHaConfig,
  haEntities, setHaEntities, haStatus, setHaStatus
}) {
  if (!showHAModal) return null;

  const connectToHA = async () => {
    setHaStatus({ loading: true, error: null, connected: false });
    try {
      const activeUrl = haConfig.type === 'local' ? haConfig.url : haConfig.customUrl;
      if (!activeUrl || !haConfig.token) {
        throw new Error("URL and Long-Lived Access Token are required.");
      }

      const baseUrl = activeUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/states`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${haConfig.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Connection failed: HTTP ${response.status}. Check your token and URL.`);
      }

      const data = await response.json();
      
      const allowedDomains = ['light', 'switch', 'fan', 'lock', 'sensor', 'binary_sensor', 'camera', 'cover', 'climate'];
      const filtered = data.filter(e => {
        const domain = e.entity_id.split('.')[0];
        return allowedDomains.includes(domain);
      });

      const formattedEntities = filtered.map(e => ({
        id: e.entity_id,
        name: e.attributes.friendly_name || e.entity_id,
        domain: e.entity_id.split('.')[0]
      })).sort((a, b) => a.id.localeCompare(b.id));

      setHaEntities(formattedEntities);
      setHaStatus({ loading: false, error: null, connected: true });
      setShowHAModal(false);
    } catch (err) {
      setHaStatus({ loading: false, error: err.message, connected: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Icons.Server /> Link to Home Assistant</h3>
          <button onClick={() => setShowHAModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"><Icons.Close /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Connect to your Home Assistant instance to automatically load your real devices (lights, switches, fans) into the Editor's dropdown menus.</p>
          
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 border p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${haConfig.type === 'local' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <input type="radio" name="urlType" checked={haConfig.type === 'local'} onChange={() => setHaConfig({ ...haConfig, type: 'local' })} className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">Local URL</div>
                <div className="text-xs text-slate-500">homeassistant.local</div>
              </div>
            </label>
            <label className={`flex-1 border p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${haConfig.type === 'custom' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <input type="radio" name="urlType" checked={haConfig.type === 'custom'} onChange={() => setHaConfig({ ...haConfig, type: 'custom' })} className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">Custom URL</div>
                <div className="text-xs text-slate-500">IP or Nabu Casa</div>
              </div>
            </label>
          </div>

          <div className="space-y-4 mb-6">
            {haConfig.type === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">YOUR URL</label>
                <input type="text" placeholder="https://192.168.1.10:8123" value={haConfig.customUrl} onChange={(e) => setHaConfig({ ...haConfig, customUrl: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex justify-between">
                <span>LONG-LIVED ACCESS TOKEN</span>
                <a href="https://www.home-assistant.io/docs/authentication/#your-account-profile" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">How to get this?</a>
              </label>
              <input type="password" placeholder="ey..." value={haConfig.token} onChange={(e) => setHaConfig({ ...haConfig, token: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
            </div>
          </div>

          {haStatus.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs">
              <strong>Connection Failed:</strong> {haStatus.error}
              <div className="mt-1 opacity-80">Note: If you are using a local HTTP URL on an HTTPS site, your browser may block it (CORS/Mixed Content).</div>
            </div>
          )}
          {haStatus.connected && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
              <Icons.Server className="w-4 h-4" /> Successfully loaded {haEntities.length} entities!
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowHAModal(false)} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors">Close</button>
            <button onClick={connectToHA} disabled={haStatus.loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              {haStatus.loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}