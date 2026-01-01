
import React, { useState, useCallback } from 'react';
import { fetchBusStopData } from './services/geminiService';
import { ConversionResult, MinecraftCoords } from './types';
import { MC_ORIGIN, LAT_TO_METERS, LNG_TO_METERS } from './constants';

const App: React.FC = () => {
  const [stopId, setStopId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateMinecraftCoords = (lat: number, lng: number): MinecraftCoords => {
    // Minecraft X = East/West (Longitude)
    // Minecraft Z = North/South (Latitude)
    // Note: In Minecraft, +Z is South, -Z is North.
    // In Real World Lat: + is North. So Z = -(Lat - OriginLat) * meters
    
    const deltaLat = lat - MC_ORIGIN.latitude;
    const deltaLng = lng - MC_ORIGIN.longitude;

    const x = Math.round(deltaLng * LNG_TO_METERS);
    const z = Math.round(-deltaLat * LAT_TO_METERS); // Inverting latitude because North is -Z in MC
    const y = MC_ORIGIN.altitude;

    return {
      x,
      y,
      z,
      originName: MC_ORIGIN.name
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopId.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { stop, sources } = await fetchBusStopData(stopId);
      const coords = calculateMinecraftCoords(stop.latitude, stop.longitude);
      
      setResult({
        stop,
        coords,
        sources
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Teleport command copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-inter selection:bg-green-500 selection:text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center shadow-lg shadow-green-900/20">
              <span className="font-pixel text-2xl">⛏️</span>
            </div>
            <div>
              <h1 className="font-pixel text-2xl tracking-wider text-green-400">KR-BUS-CRAFT</h1>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-tighter">Real-World to Block Translation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Convert Bus Stops to Blocks.
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Enter a South Korean Bus Stop ID (e.g., <span className="text-green-500 font-mono">01141</span>) to generate precise Minecraft 1:1 scale coordinates.
          </p>
        </section>

        {/* Input Form */}
        <div className="bg-zinc-800/50 p-1 rounded-2xl mb-12 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={stopId}
              onChange={(e) => setStopId(e.target.value)}
              placeholder="Enter Bus Stop ID (e.g., 01141)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-pixel">CONVERT</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Real World Info */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">📍</span>
                <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-sm">Real World Data</h3>
              </div>
              <h4 className="text-2xl font-bold mb-1">{result.stop.name}</h4>
              <p className="text-zinc-500 mb-6">{result.stop.city} (ID: {result.stop.id})</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/30">
                  <span className="text-zinc-500">Latitude</span>
                  <span className="font-mono text-blue-400">{result.stop.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/30">
                  <span className="text-zinc-500">Longitude</span>
                  <span className="font-mono text-blue-400">{result.stop.longitude.toFixed(6)}</span>
                </div>
              </div>

              {result.sources.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-zinc-600 mb-2 uppercase font-bold">Data Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((chunk: any, i) => (
                      chunk.web && (
                        <a 
                          key={i} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] bg-zinc-700/50 hover:bg-zinc-600 text-zinc-400 px-2 py-1 rounded transition-colors"
                        >
                          {chunk.web.title || 'Source'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Minecraft Info */}
            <div className="bg-zinc-800 border-2 border-green-600/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-8xl">💎</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-green-500/10 text-green-400 rounded-lg">🧱</span>
                <h3 className="font-bold text-green-500/80 uppercase tracking-widest text-sm">Minecraft Space</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-700">
                  <span className="block text-zinc-500 text-xs font-bold mb-1">X</span>
                  <span className="text-3xl font-pixel text-white">{result.coords.x}</span>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-700">
                  <span className="block text-zinc-500 text-xs font-bold mb-1">Y</span>
                  <span className="text-3xl font-pixel text-white">{result.coords.y}</span>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-700">
                  <span className="block text-zinc-500 text-xs font-bold mb-1">Z</span>
                  <span className="text-3xl font-pixel text-white">{result.coords.z}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-700 mb-6">
                <p className="text-xs text-zinc-500 mb-2">TELEPORT COMMAND</p>
                <code className="text-green-400 font-mono block mb-4">
                  /tp @s {result.coords.x} {result.coords.y} {result.coords.z}
                </code>
                <button 
                  onClick={() => copyToClipboard(`/tp @s ${result.coords.x} ${result.coords.y} ${result.coords.z}`)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Copy Command
                </button>
              </div>

              <p className="text-[10px] text-zinc-600 leading-tight">
                * Relative to <strong>{result.coords.originName}</strong> at (0, 64, 0).
                Scales assume 1 block = 1 meter.
              </p>
            </div>
          </div>
        )}

        {/* Informational Cards */}
        {!result && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: '🗺️', title: '1:1 Projection', desc: 'Calculated using precise meters-per-degree values for the Korean Peninsula.' },
              { icon: '🤖', title: 'Gemini Engine', desc: 'Powered by Gemini 3 Flash to search and resolve stop names and coordinates.' },
              { icon: '🚉', title: 'Central Origin', desc: 'All coordinates are projected with Seoul Station as the global (0,0) point.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-zinc-800/20 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-800/40 transition-colors">
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-zinc-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto p-12 text-center text-zinc-600 text-xs border-t border-zinc-800 mt-12">
        <p className="mb-2">This application is for educational and creative purposes only.</p>
        <p>© 2024 Minecraft to Real World Bridge. No affiliation with Mojang or public transit authorities.</p>
      </footer>
    </div>
  );
};

export default App;
