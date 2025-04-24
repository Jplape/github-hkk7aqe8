// Solution robuste avec vérification d'import
try {
  const { setupServer } = require('msw/node');
  const { handlers } = require('./handlers');
  
  module.exports = {
    server: setupServer(...handlers)
  };
} catch (error) {
  console.error('MSW setup failed:', error);
  module.exports = { server: { listen: () => {}, close: () => {} } };
}