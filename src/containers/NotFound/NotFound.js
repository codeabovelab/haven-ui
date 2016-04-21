import React from 'react';

export default function NotFound() {
  const s = require('./NotFound.scss');
  return (
    <div className={"container " + s.notFound}>
      <div className="jumbotron">
        <h1 className="display-3">Doh! 404!</h1>
        <p className="lead">These are <em>not</em> the droids you are looking for!</p>
      </div>
    </div>
  );
}
