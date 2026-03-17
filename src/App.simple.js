import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Hyperswitch Demo
      </h1>
      <p className="text-gray-600 mb-4">
        React is working! Count: {count}
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        Click me
      </button>
    </div>
  );
};

export default App;
