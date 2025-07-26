'use client';

import { useState } from 'react';
import { authApi, healthApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await healthApi.check();
      setResult(`Health Check Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.error('Health check error:', error);
      setResult(`Health Check Error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: 'admin@inventaris.com',
        password: 'admin123'
      });
      setResult(`Login Success: ${JSON.stringify(response, null, 2)}`);
      
      // Test profile API if login successful
      if (response.success && response.data.token) {
        try {
          const profileResponse = await authApi.getProfile();
          setResult(prev => prev + `\n\nProfile API Success: ${JSON.stringify(profileResponse, null, 2)}`);
        } catch (profileError: unknown) {
          const errorData = profileError && typeof profileError === 'object' && 'response' in profileError 
            ? (profileError as { response?: { data?: unknown } }).response?.data 
            : profileError && typeof profileError === 'object' && 'message' in profileError 
            ? (profileError as { message: string }).message 
            : 'Unknown error';
          setResult(prev => prev + `\n\nProfile API Error: ${JSON.stringify(errorData, null, 2)}`);
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorInfo = error && typeof error === 'object' && 'response' in error 
        ? {
            message: (error as { message?: string }).message,
            response: (error as { response?: { data?: unknown; status?: number } }).response?.data,
            status: (error as { response?: { data?: unknown; status?: number } }).response?.status,
            config: (error as { config?: { url?: string; method?: string; baseURL?: string } }).config ? {
              url: (error as { config?: { url?: string; method?: string; baseURL?: string } }).config?.url,
              method: (error as { config?: { url?: string; method?: string; baseURL?: string } }).config?.method,
              baseURL: (error as { config?: { url?: string; method?: string; baseURL?: string } }).config?.baseURL
            } : undefined
          }
        : { message: error instanceof Error ? error.message : 'Unknown error' };
      
      setResult(`Login Error: ${JSON.stringify(errorInfo, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <Button onClick={testHealthCheck} loading={loading}>
            Test Health Check
          </Button>
          
          <Button onClick={testLogin} loading={loading}>
            Test Login (Admin)
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {result || 'No test run yet'}
          </pre>
        </div>

        <div className="mt-8">
          <a href="/login" className="text-blue-600 hover:underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}