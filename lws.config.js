module.exports = {
  rewrite: [
    {
      "from": "/getConfig/*",
      "to": "http://localhost:5000/$1"
    },
    {
      "from": "/m/*",
      "to": "http://localhost:8889/m/$1"
    }
  ]
};
