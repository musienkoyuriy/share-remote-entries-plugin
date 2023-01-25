const extractUrlAndGlobal = require('webpack/lib/util/extractUrlAndGlobal');

const MFPluginsConstructorNames = [
  'NodeFederationPlugin',
  'ModuleFederationPlugin',
  'UniversalFederationPlugin'
];

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

    publish('remotes', entries)
  }
}

function publish(externalModules) {
  console.log(externalModules);
}

module.exports = ShareRemoteEntriesPlugin;
