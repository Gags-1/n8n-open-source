"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const { userId, getToken, isLoaded } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const testClerkAuth = async () => {
    addResult("Clerk User ID", userId);
    
    try {
      const token = await getToken({ template: "supabase" });
      addResult("Clerk Token (supabase template)", token ? "✅ Token received" : "❌ No token");
    } catch (error) {
      addResult("Clerk Token Error", error);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('count', { count: 'exact', head: true });
      
      addResult("Supabase Connection", error ? `❌ ${error.message}` : "✅ Connected");
    } catch (error) {
      addResult("Supabase Connection Error", error);
    }
  };

  const testRLSPolicies = async () => {
    try {
      // Test without auth token (should fail)
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .limit(1);
      
      addResult("RLS Test (no auth)", error ? `✅ RLS working: ${error.message}` : `❌ RLS not working: ${data}`);
    } catch (error) {
      addResult("RLS Test Error", error);
    }
  };

  const testDatabaseStructure = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'workflows' });
      
      addResult("Database Structure", error ? `❌ ${error.message}` : `✅ Table exists`);
    } catch (error) {
      // This is expected if the RPC doesn't exist
      addResult("Database Structure", "Table structure test (RPC not available)");
    }
  };

  const testEncryption = async () => {
    try {
      const testApiKey = "sk-test123456789";
      
      // Test encryption/decryption
      const { encryptApiKey, decryptApiKey } = await import('@/lib/encryption');
      
      const encrypted = encryptApiKey(testApiKey);
      const decrypted = decryptApiKey(encrypted);
      
      addResult("Encryption Test", {
        original: testApiKey,
        encrypted: encrypted,
        decrypted: decrypted,
        success: testApiKey === decrypted
      });
    } catch (error) {
      addResult("Encryption Test Error", error);
    }
  };

  const runMigration = async () => {
    try {
      setError(null);
      addResult("Migration Status", "Starting encryption migration...");
      
      const response = await fetch('/api/migrate-encryption', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addResult("Migration Success", result);
      } else {
        addResult("Migration Failed", result);
      }
    } catch (error) {
      addResult("Migration Error", error);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    await testClerkAuth();
    await testSupabaseConnection();
    await testRLSPolicies();
    await testDatabaseStructure();
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug AIFlow Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testClerkAuth}>Test Clerk Auth</Button>
            <Button onClick={testSupabaseConnection}>Test Supabase</Button>
            <Button onClick={testRLSPolicies}>Test RLS</Button>
            <Button onClick={testEncryption}>Test Encryption</Button>
            <Button onClick={runMigration} variant="destructive">Run Migration</Button>
            <Button onClick={runAllTests} variant="outline">Run All Tests</Button>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{result.test}</div>
                <div className="text-sm text-gray-600">
                  <pre>{JSON.stringify(result.result, null, 2)}</pre>
                </div>
                <div className="text-xs text-gray-400">{result.timestamp}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">Setup Checklist:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Environment variables configured</li>
              <li>❓ Database table created (run SQL from db/workflows_schema.sql)</li>
              <li>❓ Clerk JWT template "supabase" created</li>
              <li>❓ RLS policies enabled</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}