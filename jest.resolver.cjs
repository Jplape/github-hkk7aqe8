const path = require('path');
const defaultResolver = require('jest-resolve').default;

module.exports = (request, options) => {
  // Résolution spéciale pour msw/node
  if (request === 'msw/node') {
    return path.join(options.basedir, 'node_modules', 'msw', 'node', 'index.js');
  }
  
  // Résolution spéciale pour msw
  if (request === 'msw') {
    return path.join(options.basedir, 'node_modules', 'msw', 'index.js');
  }

  // Utilise le résolveur par défaut pour les autres modules
  return defaultResolver(request, options);
};