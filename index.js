const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal');
const fetch = require('node-fetch');
const { validate } = require('schema-utils');

const MFPluginsConstructorNames = [
  'NodeFederationPlugin',
  'ModuleFederationPlugin',
  'UniversalFederationPlugin',
  'NextFederationPlugin'
];

const schema = {
  type: 'object',
  properties: {
    host: {
      type: 'string'
    }
  }
};

async function publishEntries(options, entries) {
  await fetch(`${options.host}/entries`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(entries)
  });
}

class ShareRemoteEntriesPlugin {
  constructor(options = {}) {
    validate(schema, options);
  }

  apply(compiler) {
    const federationPlugin =
      (compiler.options.plugins || []).find(
        (plugin) => MFPluginsConstructorNames.includes(plugin.constructor.name)
      );

    if (!federationPlugin) {
      console.error("No ModuleFederationPlugin(s) found.");
      return;
    }

    const remotes = federationPlugin._options.remotes;
    const entries = Object.entries(remotes)
      .map(([_, urlWithGlobal]) => extractUrlAndGlobal(urlWithGlobal))
      .reduce((acc, [url, global]) => ({ ...acc, [global]: url }), {});

    publishEntries(this.options, entries);
  }
}

module.exports = ShareRemoteEntriesPlugin;
