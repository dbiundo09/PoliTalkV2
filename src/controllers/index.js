const healthCheck = (req, res) => {
  res.status(200).json({ status: 'ok' });
};

const helloWorld = (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
};

module.exports = {
  healthCheck,
  helloWorld
}; 