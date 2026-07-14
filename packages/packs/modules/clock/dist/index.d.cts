import * as react from 'react';
import { ReactElement } from 'react';
import { WidgetRuntimeProps } from '@fancydashboard/sdk/plugins/types';
import * as zod_v4_core from 'zod/v4/core';
import * as zod from 'zod';
import * as lucide_react from 'lucide-react';
export { default as manifest } from './manifest.cjs';

declare function WeatherClock(props: WidgetRuntimeProps): ReactElement;

declare function ClockWidget(props: WidgetRuntimeProps): ReactElement;

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
        category: "productivity";
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
        component: react.LazyExoticComponent<typeof ClockWidget>;
        settingsComponent: null;
        permissions: never[];
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
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "digital-minimalist";
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                colors: {
                    primary: string;
                    secondary: string;
                    accent: string;
                    background: string;
                    backgroundOpacity: number;
                };
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof ClockWidget>;
        settingsComponent: null;
        permissions: never[];
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
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "digital-neon";
                colors: {
                    accent: string;
                    background: string;
                    backgroundOpacity: number;
                    primary: string;
                    secondary: string;
                };
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof ClockWidget>;
        settingsComponent: null;
        permissions: never[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: true;
        };
        config: {
            schema: zod.ZodObject<{
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "analog-classic";
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                colors: {
                    primary: string;
                    secondary: string;
                    accent: string;
                    background: string;
                    backgroundOpacity: number;
                };
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof ClockWidget>;
        settingsComponent: null;
        permissions: never[];
        grid: {
            defaultW: number;
            defaultH: number;
            minW: number;
            minH: number;
            maxW: number;
            maxH: number;
            lockAspectRatio: true;
        };
        config: {
            schema: zod.ZodObject<{
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "analog-modern";
                colors: {
                    background: string;
                    backgroundOpacity: number;
                    primary: string;
                    secondary: string;
                    accent: string;
                };
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof ClockWidget>;
        settingsComponent: null;
        permissions: never[];
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
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "binary";
                colors: {
                    accent: string;
                    backgroundOpacity: number;
                    primary: string;
                    secondary: string;
                    background: string;
                };
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    } | {
        id: string;
        name: string;
        description: string;
        component: react.LazyExoticComponent<typeof WeatherClock>;
        settingsComponent: null;
        permissions: {
            kind: "net:fetch";
            allow: string[];
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
                style: zod.ZodDefault<zod.ZodEnum<{
                    "digital-minimalist": "digital-minimalist";
                    "digital-neon": "digital-neon";
                    "analog-classic": "analog-classic";
                    "analog-modern": "analog-modern";
                    binary: "binary";
                    "weather-clock": "weather-clock";
                }>>;
                timeFormat: zod.ZodDefault<zod.ZodEnum<{
                    "12h": "12h";
                    "24h": "24h";
                }>>;
                dateFormat: zod.ZodDefault<zod.ZodEnum<{
                    full: "full";
                    short: "short";
                    none: "none";
                }>>;
                showSeconds: zod.ZodDefault<zod.ZodBoolean>;
                colors: zod.ZodDefault<zod.ZodObject<{
                    primary: zod.ZodDefault<zod.ZodString>;
                    secondary: zod.ZodDefault<zod.ZodString>;
                    accent: zod.ZodDefault<zod.ZodString>;
                    background: zod.ZodDefault<zod.ZodString>;
                    backgroundOpacity: zod.ZodDefault<zod.ZodNumber>;
                }, zod_v4_core.$strip>>;
                typography: zod.ZodDefault<zod.ZodObject<{
                    fontFamily: zod.ZodDefault<zod.ZodEnum<{
                        sans: "sans";
                        serif: "serif";
                        mono: "mono";
                    }>>;
                    fontSize: zod.ZodDefault<zod.ZodNumber>;
                    fontWeight: zod.ZodDefault<zod.ZodEnum<{
                        light: "light";
                        normal: "normal";
                        medium: "medium";
                        semibold: "semibold";
                        bold: "bold";
                    }>>;
                }, zod_v4_core.$strip>>;
                weatherLocation: zod.ZodDefault<zod.ZodObject<{
                    mode: zod.ZodDefault<zod.ZodEnum<{
                        auto: "auto";
                        manual: "manual";
                    }>>;
                    latitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    longitude: zod.ZodDefault<zod.ZodNullable<zod.ZodNumber>>;
                    name: zod.ZodDefault<zod.ZodNullable<zod.ZodString>>;
                }, zod_v4_core.$strip>>;
            }, zod_v4_core.$strip>;
            default: {
                style: "weather-clock";
                timeFormat: "12h" | "24h";
                dateFormat: "full" | "short" | "none";
                showSeconds: boolean;
                colors: {
                    primary: string;
                    secondary: string;
                    accent: string;
                    background: string;
                    backgroundOpacity: number;
                };
                typography: {
                    fontFamily: "sans" | "serif" | "mono";
                    fontSize: number;
                    fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
                };
                weatherLocation: {
                    mode: "auto" | "manual";
                    latitude: number | null;
                    longitude: number | null;
                    name: string | null;
                };
            };
        };
    })[];
};

export { _default as default };
