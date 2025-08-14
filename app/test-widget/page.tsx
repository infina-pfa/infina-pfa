"use client";

import { useAuthContext } from "@/components/providers/auth-provider";

export default function TestWidgetPage() {
  const { user, loading } = useAuthContext();

  return (
    <div className="min-h-screen p-8 bg-[#F6F7F9]">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          ElevenLabs Widget Test
        </h1>
        
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {loading ? (
            <p>Loading authentication...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ User authenticated</p>
              <p className="text-sm text-gray-600">User ID: {user.id}</p>
              <p className="text-sm text-gray-600">Email: {user.email || "Not provided"}</p>
              <p className="text-sm text-gray-500 mt-4">
                The ElevenLabs widget is passing this user context automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-600">⚠ User not authenticated</p>
              <p className="text-sm text-gray-500">
                The ElevenLabs widget is running without user context.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Widget Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Agent ID:</strong> agent_2301k2jes0nbe4zte8ycedhzh60a</p>
            <p><strong>Dynamic Variables:</strong> {user ? `{ user_id: "${user.id}", user_email: "${user.email || ""}" }` : "None (not authenticated)"}</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Look for the ElevenLabs widget icon (usually bottom-right corner)</li>
            <li>Click on it to start a conversation</li>
            <li>The widget will have access to your user context if authenticated</li>
            <li>Try signing in/out to see how the widget adapts</li>
          </ol>
        </div>
      </div>
    </div>
  );
}