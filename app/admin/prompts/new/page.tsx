'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const NewPromptPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, template }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt template');
      }

      // Redirect to the dashboard on success
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Prompt Template</h1>
          <p className="text-gray-500 mb-8">Define a new agent specialist that users can interact with.</p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="template-name" className="text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Google Ads - Headline Generator"
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
                  onChange={(e) => setDescription(e.targe.value)}
                  placeholder="A short description of what this agent does."
                  className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="template-body" className="text-sm font-medium text-gray-700">Template Body</label>
                <p className="text-sm text-gray-500 mb-2">
                  Use placeholders like `{{productName}}` or `{{targetAudience}}` for dynamic content.
                </p>
                <textarea
                  id="template-body"
                  rows={10}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Craft the prompt here. For example: 'Generate 5 compelling headlines for a Google Ad about a {{productName}} targeting {{targetAudience}}.'"
                  className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              {error && (
                <div className="text-red-600 bg-red-100 border border-red-400 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-4">
                <Link href="/admin/dashboard" passHref>
                   <button type="button" className="px-6 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </Link>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPromptPage;
