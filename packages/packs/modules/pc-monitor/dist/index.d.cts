import * as react from 'react';
import { ReactElement } from 'react';
import { WidgetRuntimeProps } from '@fancydashboard/sdk/plugins/types';
import * as zod_v4_core from 'zod/v4/core';
import * as zod from 'zod';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as lucide_react from 'lucide-react';
export { default as manifest } from './manifest.cjs';

declare function SystemDashboardWidget(_props: WidgetRuntimeProps): ReactElement;

declare function Temp(_props: WidgetRuntimeProps): ReactElement;

declare function RAM(_props: WidgetRuntimeProps): ReactElement;

declare function PCMonitor(_props: WidgetRuntimeProps): react_jsx_runtime.JSX.Element;

declare function GlobalSettings(): ReactElement;

declare const _default: {
    id: string;
    version: "1.0.0";
    metadata: {
        name: string;
        summary: string;
        description: string;
        author: {
            name: string;
            email: null;
            github: null;
        };
        website: null;
        license: string;
        repository: null;
        category: "monitoring";
        tags: never[];
        tier: "community";
    };
    icon: {
        type: "react-icon";
        component: react.ForwardRefExoticComponent<Omit<lucide_react.LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>;
    };
    globalSettings: react.LazyExoticComponent<typeof GlobalSettings>;
    globalPermissions: never[];
    widgets: ({
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof PCMonitor>;
        settingsComponent: null;
        permissions: {
            kind: "store:read";
        }[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: false;
        };
        config: {
            schema: zod.ZodObject<{
                monitorType: zod.ZodDefault<zod.ZodEnum<{
                    cpu: "cpu";
                    ram: "ram";
                    gpu: "gpu";
                    all: "all";
                }>>;
                showTemperature: zod.ZodDefault<zod.ZodBoolean>;
                refreshInterval: zod.ZodDefault<zod.ZodNumber>;
            }, zod_v4_core.$strip>;
            default: {
                monitorType: "cpu" | "ram" | "gpu" | "all";
                showTemperature: boolean;
                refreshInterval: number;
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof RAM>;
        settingsComponent: null;
        permissions: {
            kind: "store:read";
        }[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: false;
        };
        config: {
            schema: zod.ZodObject<{
                showSparkline: zod.ZodDefault<zod.ZodBoolean>;
                compactMode: zod.ZodDefault<zod.ZodBoolean>;
            }, zod_v4_core.$strip>;
            default: {
                showSparkline: boolean;
                compactMode: boolean;
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof Temp>;
        settingsComponent: null;
        permissions: {
            kind: "store:read";
        }[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: false;
        };
        config: {
            schema: zod.ZodObject<{
                showAllProbes: zod.ZodDefault<zod.ZodBoolean>;
                showSparkline: zod.ZodDefault<zod.ZodBoolean>;
            }, zod_v4_core.$strip>;
            default: {
                showAllProbes: boolean;
                showSparkline: boolean;
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof SystemDashboardWidget>;
        settingsComponent: null;
        permissions: ({
            kind: "store:read";
        } | {
            kind: "store:write";
        })[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: false;
        };
        config: {
            schema: zod.ZodObject<{
                layout: zod.ZodDefault<zod.ZodArray<zod.ZodObject<{
                    id: zod.ZodString;
                    type: zod.ZodEnum<{
                        cpu: "cpu";
                        ram: "ram";
                        gpu: "gpu";
                        temp: "temp";
                    }>;
                    position: zod.ZodObject<{
                        x: zod.ZodNumber;
                        y: zod.ZodNumber;
                    }, zod_v4_core.$strip>;
                    size: zod.ZodObject<{
                        w: zod.ZodNumber;
                        h: zod.ZodNumber;
                    }, zod_v4_core.$strip>;
                }, zod_v4_core.$strip>>>;
                showSparklines: zod.ZodDefault<zod.ZodBoolean>;
                compactMode: zod.ZodDefault<zod.ZodBoolean>;
            }, zod_v4_core.$strip>;
            default: {
                layout: {
                    id: string;
                    type: "cpu" | "ram" | "gpu" | "temp";
                    position: {
                        x: number;
                        y: number;
                    };
                    size: {
                        w: number;
                        h: number;
                    };
                }[];
                showSparklines: boolean;
                compactMode: boolean;
            };
        };
    })[];
};

export { _default as default };
