import { useEffect, useLayoutEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { CLOUD_PAGES, VIEW_MODES } from "~/constants";
import type { CloudPage, ViewMode } from "~/types";
import { IntentEvent } from "~/util/global-events";
import { type Intent, type IntentPayload, type IntentType, consumeIntent } from "~/util/intents";
import { useEventSubscription } from "./event";
import { useStable } from "./stable";

/**
 * Returns the active view mode and a function to set it
 */
export function useActiveView() {
	const [location, navigate] = useLocation();

	const activeView = Object.values(VIEW_MODES).find((info) => location.startsWith(`/${info.id}`));
	const setActiveView = useStable((view: ViewMode) => {
		navigate(`/${view}`);
	});

	return [activeView, setActiveView] as const;
}

/**
 * Returns the active cloud page and a function to set it
 */
export function useActiveCloudPage() {
	const [location, navigate] = useLocation();

	const activePage = Object.values(CLOUD_PAGES).find((info) =>
		location.startsWith(`/cloud/${info.id}`),
	);

	const setActivePage = useStable((view: CloudPage) => {
		navigate(`/cloud/${view}`);
	});

	return [activePage, setActivePage] as const;
}

/**
 * Listen to the specified intent and invoke the handler when it is dispatched.
 *
 * @param type The intent type to listen for
 * @param handler The handler to invoke when the intent is dispatched
 */
export function useIntent(type: IntentType, handler: (payload: IntentPayload) => void) {
	const handleIntent = useStable(() => {
		for (let intent = consumeIntent(type); intent; intent = consumeIntent(type)) {
			handler(intent.payload || {});
		}
	});

	useEffect(() => handleIntent(), []);
	useEventSubscription(IntentEvent, handleIntent);
}

/**
 * Subscribe to the URL search parameters
 */
export function useSearchParams() {
	const search = useSearch();

	return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

/**
 * Accepts a function to invoke when the specified view
 * is activated.
 *
 * @param view The view to listen for
 * @param callback The function to invoke
 */
export function useViewFocus(view: ViewMode, callback: () => void, deps: any[] = []) {
	const [activeView] = useActiveView();
	const stable = useStable(callback);

	// NOTE - should this be useLayoutEffect?
	useEffect(() => {
		if (activeView?.id === view) {
			stable();
		}
	}, [activeView, view, ...deps]);
}

/**
 * Accepts a function to invoke when the specified cloud page
 * is activated.
 *
 * @param page The cloud page to listen for
 * @param callback The function to invoke
 */
export function useCloudPageFocus(page: CloudPage, callback: () => void, deps: any[] = []) {
	const [activePage] = useActiveCloudPage();
	const stable = useStable(callback);

	useLayoutEffect(() => {
		if (activePage?.id === page) {
			stable();
		}
	}, [activePage, page, ...deps]);
}
