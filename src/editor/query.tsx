import { StateEffect, StateField } from "@codemirror/state";
import type { Command, EditorView } from "@codemirror/view";
import { executeGraphql, executeUserQuery } from "~/screens/database/connection/connection";
import { getActiveConnection } from "~/util/connection";
import { tryParseParams } from "~/util/helpers";

const queryEditorEffect = StateEffect.define<EditorView>();

/**
 * The field holding the target query editor
 */
export const queryEditorField = StateField.define<EditorView | undefined>({
	create() {
		return undefined;
	},
	update(set, tr) {
		for (const e of tr.effects) {
			if (e.is(queryEditorEffect)) {
				return e.value;
			}
		}

		return set;
	},
});

/**
 * Set the query editor the current view is using
 *
 * @param currentView The view to update
 * @param queryView The view holding the query
 */
export function setQueryEditor(currentView: EditorView, queryView?: EditorView) {
	currentView.dispatch({
		effects: queryEditorEffect.of(queryView ?? currentView),
	});
}

/**
 * Execute the contents of the editor as a query
 * The source editor can be overriden using the `queryEditorEffect`
 */
export const executeEditorQuery: Command = (view: EditorView) => {
	const editor = view.state.field(queryEditorField, false) ?? view;
	const query = editor.state.doc.toString();
	const selection = editor.state.selection.main;

	executeUserQuery({
		override: selection?.empty === false ? query.slice(selection.from, selection.to) : query,
	});

	return true;
};

/**
 * Execute the contents of the editor as a GraphQL query
 */
export const executeGraphqlEditorQuery: Command = () => {
	const connection = getActiveConnection();
	const params = tryParseParams(connection.graphqlVariables);

	executeGraphql(connection.graphqlQuery, params);

	return true;
};