const { validate } = require('schema-utils');
const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal');
const fetch = require('node-fetch');

const MFPluginsConstructorNames = [
  'NodeFederationPlugin',
  'ModuleFederationPlugin',
  'UniversalFederationPlugin',
  'NextFederationPlugin',
];

const schema = {
  type: 'object',
  properties: {
    host: {
      type: 'string',
    },
  },
};

function publishEntries(options, entries) {
  fetch(options.host, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(entries),
  });
}

function normalizeRemoteEntry(remoteEntry) {
  const [key, value] = remoteEntry;
  return value.startsWith('promise ') ? ['Runtime', key] : extractUrlAndGlobal(value);
}

class ShareRemoteEntriesPlugin {
  constructor(options = {}) {
    this.options = options;
    validate(schema, options);
  }
  apply(compiler) {
    const federationPlugin = (compiler.options.plugins || []).find(
      plugin => MFPluginsConstructorNames.includes(plugin.constructor.name),
    );

    if (!federationPlugin) {
      console.error('No ModuleFederationPlugin(s) found.');
      return;
    }

    const remotes = federationPlugin._options.remotes;
    const entries = Object.entries(remotes)
      .map(entry => normalizeRemoteEntry(entry))
      reduce((acc, [url, global]) => ({ ...acc, [global]: url }), {});

    publishEntries(this.options, entries);
  }
}

module.exports = ShareRemoteEntriesPlugin;