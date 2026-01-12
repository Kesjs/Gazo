'use client'

import { useEffect } from 'react'

export default function TestPage() {
  console.log('🧪 TestPage: Component mounted!')

  useEffect(() => {
    console.log('🧪 TestPage: useEffect executed')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, the app is working!</p>
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          Console logs should appear above
        </div>
      </div>
    </div>
  )
}
