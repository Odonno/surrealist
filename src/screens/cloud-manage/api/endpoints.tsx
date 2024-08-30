import { useConfigStore } from "~/stores/config";
import { featureFlags } from "~/util/feature-flags";

const CLOUD_AUTH_BASE = "https://surrealdb.us.auth0.com";
const CLOUD_API_BASE = "https://api.surrealdb.cloud/api/v1";
const CLOUD_API_MGMT_BASE = "https://api.surrealdb.cloud/management/v1";

export function getCloudEndpoints() {
	const { urlAuthBase, urlApiBase, urlApiMgmtBase } = useConfigStore.getState().settings.cloud;
	const isCustom = featureFlags.get("cloud_endpoints") === "custom";

	return {
		authBase: isCustom ? urlAuthBase : CLOUD_AUTH_BASE,
		apiBase: isCustom ? urlApiBase : CLOUD_API_BASE,
		mgmtBase: isCustom ? urlApiMgmtBase : CLOUD_API_MGMT_BASE
	};
}