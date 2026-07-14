import React from 'react';

export const Widget: React.FC = () => {
  return (
    <div style={{ padding: '1rem', background: '#333', color: '#fff', height: '100%' }}>
      <h3>{{pluginName}}</h3>
      <p>Hello from community plugin!</p>
    </div>
  );
};
