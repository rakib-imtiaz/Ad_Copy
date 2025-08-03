'use client';

import { motion } from 'framer-motion';
import { Palette, Save, Upload, Volume2, Type } from 'lucide-react';

const brandColors = [
  { name: 'Primary', color: '#4F46E5', description: 'Main brand color' },
  { name: 'Secondary', color: '#10B981', description: 'Accent color' },
  { name: 'Neutral', color: '#6B7280', description: 'Text and borders' },
  { name: 'Background', color: '#F9FAFB', description: 'Page backgrounds' },
];

const voiceTones = [
  { name: 'Professional', description: 'Formal and business-like', active: true },
  { name: 'Friendly', description: 'Warm and approachable', active: false },
  { name: 'Casual', description: 'Relaxed and informal', active: false },
  { name: 'Authoritative', description: 'Confident and expert', active: false },
];

const BrandingPage = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Brand Customization
          </motion.h1>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Customize your brand appearance and voice
          </motion.p>
        </div>
        <motion.button 
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Save size={18} />
          <span>Save Changes</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Brand Colors */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Palette size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Brand Colors</h2>
          </div>
          
          <div className="space-y-4">
            {brandColors.map((color) => (
              <motion.div
                key={color.name}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: color.color }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{color.name}</h3>
                  <p className="text-sm text-gray-500">{color.description}</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Edit
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Brand Assets */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Upload size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Brand Assets</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Upload Logo</h3>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Choose File
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Upload Favicon</h3>
              <p className="text-sm text-gray-500 mb-4">ICO, PNG up to 1MB</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Choose File
              </button>
            </div>
          </div>
        </motion.div>

        {/* Voice & Tone */}
        <motion.div 
          className="bg-white rounded-xl shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Volume2 size={24} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Voice & Tone</h2>
          </div>
          
          <div className="space-y-3">
            {voiceTones.map((tone) => (
              <motion.div
                key={tone.name}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  tone.active 
                    ? 'bg-indigo-50 border border-indigo-200' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${tone.active ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {tone.name}
                    </h3>
                    <p className="text-sm text-gray-500">{tone.description}</p>
                  </div>
                  {tone.active && (
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Typography</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Heading Font</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Body Font</span>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default BrandingPage;
