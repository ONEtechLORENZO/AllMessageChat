import React from 'react';



export default function Error({ status }) {

  return (

    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>

      <h1>Error {status || 500}</h1>

      <p>Something went wrong.</p>

    </div>

  );

}
