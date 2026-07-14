import type { ModuleManifest } from '@fancydashboard/sdk/plugins/types';
import { Widget } from './module/Widget';

const moduleEntry: ModuleManifest = {
  id: '@fancydashboard/pack-module-{{pluginName}}',
  widgets: {
    '{{pluginName}}': Widget
  }
};

export default moduleEntry;
