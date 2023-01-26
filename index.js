const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal');
const fetch = require('node-fetch');

const MFPluginsConstructorNames = [
  'NodeFederationPlugin',
  'ModuleFederationPlugin',
  'UniversalFederationPlugin'
];

const EXTENSION_BASE_URL = 'http://localhost:3000';

async function publishEntries(externalModules) {
  await fetch(`${EXTENSION_BASE_URL}/entries`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(entries)
  });
}

class ShareRemoteEntriesPlugin {
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

    publishEntries(entries);
  }
}

module.exports = ShareRemoteEntriesPlugin;
