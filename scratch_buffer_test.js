const fetch = require('node-fetch');

const query = `
  query {
    __schema {
      types {
        name
        inputFields {
          name
          type { name kind ofType { name kind } }
        }
      }
    }
  }
`;

fetch('https://api.buffer.com', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 1-btdGMuRQ6RH24tM4AEMVsepoSPcj-hnknZOw58Q1G',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
.then(r => r.json())
.then(data => {
  const types = data.data.__schema.types;
  const channelsInput = types.find(t => t.name === 'ChannelsInput');
  console.log('ChannelsInput Fields:', JSON.stringify(channelsInput, null, 2));
})
.catch(console.error);
