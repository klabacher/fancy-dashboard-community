import type { ModuleManifest } from '@fancydashboard/sdk/manifest';

export const manifest: ModuleManifest = {
  id: '@fancydashboard/pack-module-{{pluginName}}',
  name: '{{pluginName}}',
  description: 'A community plugin for FancyDashboard',
  version: '1.0.0',
  entry: {
    frontend: './index.js'
  },
  widgets: [
    {
      type: '{{pluginName}}',
      name: '{{pluginName}} Widget',
      description: 'Default widget for {{pluginName}}',
      defaultConfig: {},
      dimensions: {
        default: { w: 2, h: 2 },
        min: { w: 1, h: 1 },
        max: { w: 4, h: 4 }
      }
    }
  ]
};
