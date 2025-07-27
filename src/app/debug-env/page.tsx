"use client"

export default function DebugEnvPage() {
  const envVars = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Environment Variables Debug
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Current Environment Variables
          </h2>
          
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {key}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  value 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {value ? '✅ SET' : '❌ NOT SET'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Debug Information
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Node.js Environment: {process.env.NODE_ENV}</li>
              <li>• Next.js loads .env.local automatically in development</li>
              <li>• Only NEXT_PUBLIC_* variables are available in the browser</li>
              <li>• Check that .env.local exists in the project root</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}