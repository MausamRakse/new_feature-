"use client";

import { useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, AlertCircle, Copy } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'Ecommerce',
    business_size: 'Solo',
    website_url: '',
    target_audience: '',
    agent_type: 'Sales Agent',
    primary_goal: 'Sell product/service',
    tone: 'Formal',
    language: 'English',
    response_style: 'Short & direct',
    conversation_rules: '',
    restricted_topics: '',
    escalation_condition: 'Angry user',
    product_details: '',
    faqs: '',
    custom_instructions: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/save-agent-config' 
        : 'http://localhost:8000/api/save-agent-config';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the backend. Ensure it is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.generated_prompt) {
      navigator.clipboard.writeText(JSON.stringify(result.generated_prompt, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-lg mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Agent Configurator</h1>
          <p className="mt-2 text-gray-600">Design your perfect calling agent in one simple step.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Business Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-primary text-sm flex items-center justify-center font-bold">1</span>
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Business Name *</label>
                  <input required name="business_name" value={formData.business_name} onChange={handleChange} className="input-field" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="label-text">Website URL <span className="text-gray-400 font-normal">(We'll scrape this for you)</span></label>
                  <input name="website_url" value={formData.website_url} onChange={handleChange} type="url" className="input-field" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="label-text">Business Type *</label>
                  <select required name="business_type" value={formData.business_type} onChange={handleChange} className="input-field">
                    <option>Ecommerce</option><option>SaaS</option><option>Service</option>
                    <option>Healthcare</option><option>Education</option><option>Real Estate</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Business Size *</label>
                  <select required name="business_size" value={formData.business_size} onChange={handleChange} className="input-field">
                    <option>Solo</option><option>Small (1–10)</option><option>Medium (10–50)</option><option>Large (50+)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-text">Target Audience *</label>
                  <input required name="target_audience" value={formData.target_audience} onChange={handleChange} className="input-field" placeholder="e.g. Small business owners in the UK" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Agent Setup Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-primary text-sm flex items-center justify-center font-bold">2</span>
                Agent Setup
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Agent Type *</label>
                  <select required name="agent_type" value={formData.agent_type} onChange={handleChange} className="input-field">
                    <option>Sales Agent</option><option>Customer Support</option><option>Receptionist</option>
                    <option>Consultant</option><option>Lead Qualification</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Primary Goal *</label>
                  <select required name="primary_goal" value={formData.primary_goal} onChange={handleChange} className="input-field">
                    <option>Sell product/service</option><option>Book appointments</option><option>Answer queries</option>
                    <option>Collect leads</option><option>Provide consultation</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Tone *</label>
                  <select required name="tone" value={formData.tone} onChange={handleChange} className="input-field">
                    <option>Formal</option><option>Friendly</option><option>Persuasive</option><option>Professional</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Language *</label>
                  <select required name="language" value={formData.language} onChange={handleChange} className="input-field">
                    <option>English</option><option>Hindi</option><option>Hinglish</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Response Style *</label>
                  <select required name="response_style" value={formData.response_style} onChange={handleChange} className="input-field">
                    <option>Short & direct</option><option>Detailed</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Escalation Condition *</label>
                  <select required name="escalation_condition" value={formData.escalation_condition} onChange={handleChange} className="input-field">
                    <option>Angry user</option><option>Complex query</option><option>Ask for human</option><option>Never escalate</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Knowledge & Rules Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-primary text-sm flex items-center justify-center font-bold">3</span>
                Knowledge & Rules
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="label-text">Conversation Rules</label>
                  <textarea name="conversation_rules" value={formData.conversation_rules} onChange={handleChange} rows={2} className="input-field resize-y" placeholder="e.g. Always verify the caller's name first." />
                </div>
                <div>
                  <label className="label-text">Restricted Topics</label>
                  <textarea name="restricted_topics" value={formData.restricted_topics} onChange={handleChange} rows={2} className="input-field resize-y" placeholder="e.g. Competitor pricing, politics." />
                </div>
                <div>
                  <label className="label-text">Product Details</label>
                  <textarea name="product_details" value={formData.product_details} onChange={handleChange} rows={3} className="input-field resize-y" placeholder="Describe the products the agent can discuss..." />
                </div>
                <div>
                  <label className="label-text">FAQs</label>
                  <textarea name="faqs" value={formData.faqs} onChange={handleChange} rows={3} className="input-field resize-y" placeholder="Q: Are you a bot? A: Yes, I am an AI assistant..." />
                </div>
                <div>
                  <label className="label-text">Custom Instructions</label>
                  <textarea name="custom_instructions" value={formData.custom_instructions} onChange={handleChange} rows={2} className="input-field resize-y" placeholder="Any final prompt overrides..." />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Agent...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create AI Configuration <ChevronRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Configuration Generated
              </h3>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary bg-white border border-gray-200 rounded-lg shadow-sm hover:border-primary transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <div className="p-6">
              <div className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p><strong>Database:</strong> {result.message}</p>
                <p><strong>Website Scraper:</strong> Extracted {result.extracted_website_summary_length} characters from URL.</p>
              </div>
              <pre className="bg-[#0f172a] text-blue-300 p-4 rounded-xl overflow-x-auto text-sm">
                <code>
                  {result.generated_prompt 
                    ? JSON.stringify(result.generated_prompt, null, 2) 
                    : "// No prompt generated. Did you add the GEMINI_API_KEY?"}
                </code>
              </pre>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
