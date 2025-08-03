'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, History, CheckCircle } from 'lucide-react';

const mockTemplate = {
  id: 1,
  name: 'Google Ads - Headline Generator',
  description: 'Generates compelling headlines for Google Ads.',
  template: 'Generate 5 compelling headlines for a Google Ad about a {{productName}} targeting {{targetAudience}}.',
  versions: [
    { id: 3, version: 'v3', status: 'Active', lastUpdated: '2 days ago' },
    { id: 2, version: 'v2', status: 'Inactive', lastUpdated: '1 month ago' },
    { id: 1, version: 'v1', status: 'Inactive', lastUpdated: '3 months ago' },
  ]
};

const EditPromptPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setName(mockTemplate.name);
      setDescription(mockTemplate.description);
      setTemplate(mockTemplate.template);
      setVersions(mockTemplate.versions);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <Link href="/admin/prompts" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              Back to All Templates
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Prompt Template</h1>
            <p className="text-gray-500 mb-8">Update the details for this agent specialist.</p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="template-name" className="text-sm font-medium text-gray-700">Template Name</label>
                  <input
                    type="text"
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="template-description" className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="template-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="template-body" className="text-sm font-medium text-gray-700">Template Body (Version v4 - New Draft)</label>
                   <textarea
                    id="template-body"
                    rows={10}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex justify-end space-x-4 mt-4">
                  <Link href="/admin/prompts" passHref>
                     <button type="button" className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  </Link>
                  <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save as New Version (v4)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl shadow p-8 mt-16">
             <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
               <History size={22} className="mr-3 text-gray-500"/>
               Version History
            </h2>
            <div className="space-y-4">
              {versions.map(v => (
                <div key={v.id} className={`p-4 rounded-lg border ${v.status === 'Active' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{v.version}</p>
                    {v.status === 'Active' ? (
                       <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                         <CheckCircle size={14} className="mr-1"/>
                         Active
                       </span>
                    ) : (
                       <button className="text-xs font-semibold text-indigo-600 hover:underline">
                        Set Active
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Updated: {v.lastUpdated}</p>
                </div>
              ))}
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EditPromptPage;
