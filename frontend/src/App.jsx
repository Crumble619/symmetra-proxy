import { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, CheckCircle, User, Zap, AlertTriangle, Users } from 'lucide-react';

// Use your DigitalOcean proxy URL
const API_BASE = 'https://symmetra-proxy-p9yr4.ondigitalocean.app';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSample, setActiveSample] = useState(null);

  const samples = [
    { 
      id: 1, 
      name: "Patient A - Resting", 
      description: "Normal adult male, 72 bpm",
      icon: User,
      color: "text-blue-400"
    },
    { 
      id: 2, 
      name: "Patient B - Post Exercise", 
      description: "Elevated heart rate, 98 bpm",
      icon: Zap,
      color: "text-orange-400"
    },
    { 
      id: 3, 
      name: "Patient C - Irregular", 
      description: "Possible arrhythmia detected",
      icon: AlertTriangle,
      color: "text-amber-400"
    },
  ];

  const runPrediction = async (sampleId = null) => {
    setLoading(true);
    setActiveSample(sampleId);

    try {
      const response = await axios.post(`${API_BASE}/api/api/predict/`, { 
        sample_id: sampleId 
      });
      
      setResults(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend. Make sure the inference server is running on your home VM.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold flex items-center gap-4">
              <Activity className="text-emerald-400" size={48} />
              Symmetra
            </h1>
            <p className="text-zinc-400 text-xl mt-1">
              Joint ECG • Blood Pressure • SpO₂ Prediction Demo
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-medium">Colin Greene • CS Graduate</p>
            <p className="text-xs text-zinc-500">Django + React Full-Stack AI Demo</p>
          </div>
        </div>

        {/* Patient Samples */}
        <div className="mb-14">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users size={28} className="text-zinc-400" />
            <h2 className="text-2xl font-semibold">Patient Samples</h2>
          </div>

          <div className="flex justify-center gap-8">
            {samples.map((sample) => {
              const isActive = activeSample === sample.id;
              const IconComponent = sample.icon;

              return (
                <button
                  key={sample.id}
                  onClick={() => runPrediction(sample.id)}
                  disabled={loading}
                  className={`w-80 flex-shrink-0 bg-zinc-900 border rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                    ${isActive 
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-950 to-zinc-900 shadow-2xl shadow-emerald-900/50' 
                      : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'}`}
                >
                  {isActive && (
                    <div className="flex justify-end mb-6">
                      <CheckCircle className="text-emerald-400" size={28} />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className={`p-5 rounded-2xl bg-zinc-800 mb-6 transition-all
                      ${isActive ? 'bg-emerald-900/60' : ''}`}>
                      <IconComponent 
                        size={52} 
                        className={`${sample.color} ${isActive ? 'text-emerald-400' : ''}`} 
                      />
                    </div>
                    
                    <div className="font-semibold text-xl tracking-tight mb-3">
                      {sample.name}
                    </div>
                    <div className="text-zinc-400 text-[15px] leading-relaxed">
                      {sample.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Display */}
        <div className="bg-zinc-900 rounded-3xl p-10">
          {results ? (
            <div className="space-y-10">
              {/* Model Status */}
              {results.model_status && (
                <div className="bg-emerald-950/60 border border-emerald-500/30 p-6 rounded-2xl text-center">
                  <p className="text-emerald-400 font-medium text-lg">
                    {results.model_status}
                  </p>
                  {results.note && <p className="text-zinc-400 text-sm mt-2">{results.note}</p>}
                </div>
              )}

              {/* Vital Signs */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-800 p-7 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">Systolic BP</p>
                  <p className="text-5xl font-bold text-orange-400 mt-3">
                    {results.bp?.sbp ?? '—'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">mmHg</p>
                </div>
                <div className="bg-zinc-800 p-7 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">Diastolic BP</p>
                  <p className="text-5xl font-bold text-orange-400 mt-3">
                    {results.bp?.dbp ?? '—'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">mmHg</p>
                </div>
                <div className="bg-zinc-800 p-7 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm">SpO₂</p>
                  <p className="text-5xl font-bold text-cyan-400 mt-3">
                    {results.spo2 ?? '—'}%
                  </p>
                </div>
              </div>

              {/* ECG Result */}
              <div className="text-center">
                <p className="text-zinc-400 text-lg">ECG Classification (AAMI 5-Class)</p>
                <p className="text-4xl font-semibold mt-4 tracking-tight">
                  {results.ecg_class ?? '—'}
                </p>
                <p className="text-emerald-400 mt-2">
                  Confidence: {results.confidence ?? '—'}%
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-zinc-500">
              <Heart size={80} className="opacity-40 mb-6" />
              <p className="text-xl">Select a patient sample to run inference</p>
            </div>
          )}
        </div>

        {/* Waveforms Section */}
        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-6 text-center">Live Waveforms (Real Data)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ECG Waveform */}
            <div className="bg-zinc-900 rounded-3xl p-8">
              <p className="text-zinc-400 mb-4 text-center">ECG Waveform (Real)</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart 
                  data={results?.waveforms?.ecg 
                    ? results.waveforms.ecg.map((v, i) => ({ x: i, value: v }))
                    : Array.from({ length: 250 }, (_, i) => ({ x: i, value: Math.sin(i / 6) * 0.9 }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="natural" dataKey="value" stroke="#10b981" strokeWidth={3.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* PPG Waveform */}
            <div className="bg-zinc-900 rounded-3xl p-8">
              <p className="text-zinc-400 mb-4 text-center">PPG Waveform (Real)</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart 
                  data={results?.waveforms?.ppg 
                    ? results.waveforms.ppg.map((v, i) => ({ x: i, value: v }))
                    : Array.from({ length: 250 }, (_, i) => ({ x: i, value: Math.sin(i / 12) * 1.4 + 1.6 }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="natural" dataKey="value" stroke="#22d3ee" strokeWidth={3.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 mt-20">
          Full-Stack AI Demo • Django + React + PyTorch • Real clinical waveforms used • Not for medical diagnosis
        </div>
      </div>
    </div>
  );
}

export default App;