import { FeatureFlags, TFeatureFlags } from "@theopensource-company/feature-flags";
import { featureFlagsHookFactory } from "@theopensource-company/feature-flags/react";
import { environment } from "./environment";

// How to manage feature flag schema:
// https://github.com/theopensource-company/feature-flags?tab=readme-ov-file#writing-a-schema
export const schema = {
	feature_flags: {
		options: [false, true]
	},
	models_view: {
		options: [false, true, 'force']
	},
	apidocs_view: {
		options: [false, true]
	},
	themes: {
		options: [false, true]
	},
	newsfeed: {
		options: [false, true]
	},
	database_version_check: {
		options: [false, true]
	},
	highlight_tool: {
		options: [false, true],
	},
	surreal_compat: {
		options: ['v1', 'v2'],
	},
	changelog: {
		options: ['auto', 'hidden', 'read', 'unread'],
	},
} as const;

export const featureFlags = new FeatureFlags({
	environment,
	schema,
	defaults: {
		development: {
			database_version_check: false,
			feature_flags: true,
			models_view: "force",
			apidocs_view: true,
			newsfeed: true,
			highlight_tool: true,
			surreal_compat: 'v1'
		},
		preview: {
			database_version_check: true,
			models_view: true,
			apidocs_view: true,
			newsfeed: true,
			surreal_compat: 'v1'
		},
		production: {
			database_version_check: true,
			models_view: true,
			apidocs_view: true,
			newsfeed: true,
			surreal_compat: 'v1'
		},
	},
	overrides: (flag) => {
		const value = import.meta.env[`VITE_FFLAG_${flag.toUpperCase()}`];

		if (value) {
			return JSON.parse(value);
		}
	},
});

export const useFeatureFlags = featureFlagsHookFactory(featureFlags);

export type FeatureFlagMap = TFeatureFlags<typeof schema>;
