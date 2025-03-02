import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function TestDbPage() {
  const user = await currentUser();
  
  let dbStatus = {
    connected: false,
    error: null,
    collections: [],
    connectionInfo: null,
    models: null
  };
  
  try {
    console.log('TestDB: Connecting to database...');
    await connectToDatabase();
    dbStatus.connected = true;
    console.log('TestDB: Connected to database');
    
    // Get connection info
    dbStatus.connectionInfo = {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      models: Object.keys(mongoose.models)
    };
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    dbStatus.collections = collections.map(c => c.name);
    console.log('TestDB: Collections:', dbStatus.collections);
    
    // Get models info
    dbStatus.models = {};
    for (const modelName of Object.keys(mongoose.models)) {
      try {
        const count = await mongoose.models[modelName].countDocuments();
        dbStatus.models[modelName] = { count };
      } catch (err) {
        dbStatus.models[modelName] = { error: err.message };
      }
    }
    
  } catch (error) {
    console.error('TestDB: Error connecting to database:', error);
    dbStatus.error = error.message;
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">User Info</h2>
        {user ? (
          <div>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          </div>
        ) : (
          <p>Not authenticated</p>
        )}
      </div>
      
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Database Status</h2>
        <div className={`p-3 rounded ${dbStatus.connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {dbStatus.connected ? 'Connected to MongoDB' : 'Not connected to MongoDB'}
          {dbStatus.error && <p className="mt-2"><strong>Error:</strong> {dbStatus.error}</p>}
        </div>
        
        {dbStatus.connectionInfo && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Connection Info</h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(dbStatus.connectionInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {dbStatus.collections.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Collections</h2>
          <ul className="list-disc pl-5">
            {dbStatus.collections.map(collection => (
              <li key={collection}>{collection}</li>
            ))}
          </ul>
        </div>
      )}
      
      {dbStatus.models && Object.keys(dbStatus.models).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Models</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Model</th>
                <th className="border p-2 text-left">Document Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dbStatus.models).map(([modelName, info]) => (
                <tr key={modelName}>
                  <td className="border p-2">{modelName}</td>
                  <td className="border p-2">
                    {info.error ? <span className="text-red-500">{info.error}</span> : info.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
} 