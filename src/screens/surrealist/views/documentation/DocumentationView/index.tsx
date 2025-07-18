import { Group } from "@mantine/core";
import { memo, useMemo, useRef, useState } from "react";
import { useSetting } from "~/hooks/config";
import { useViewFocus } from "~/hooks/routing";
import { buildDocumentation } from "~/screens/surrealist/docs";
import { useDatabaseStore } from "~/stores/database";
import { syncConnectionSchema } from "~/util/schema";
import { ArticlePane } from "../ArticlePane";
import { TocPane } from "../TopicsPane";

const ArticlePaneLazy = memo(ArticlePane);
const TocPaneLazy = memo(TocPane);

export function DocumentationView() {
	const [language, setLanguage] = useSetting("behavior", "docsLanguage");

	const schema = useDatabaseStore((s) => s.connectionSchema);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState("");

	const docs = useMemo(() => (schema ? buildDocumentation(schema) : []), [schema]);

	useViewFocus("documentation", () => {
		syncConnectionSchema();
	});

	return (
		<Group
			h="100%"
			wrap="nowrap"
			gap="var(--surrealist-divider-size)"
			pr="lg"
			pb="lg"
			pl={{ base: "lg", md: 0 }}
		>
			<TocPaneLazy
				active={active}
				docs={docs}
				language={language}
				scrollRef={scrollRef}
			/>
			<ArticlePaneLazy
				docs={docs}
				language={language}
				scrollRef={scrollRef}
				onLanguageChange={setLanguage}
				onChangeActiveTopic={setActive}
			/>
		</Group>
	);
}

export default DocumentationView;
