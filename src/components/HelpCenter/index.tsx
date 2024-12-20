import classes from "./style.module.scss";

import {
	iconAPI,
	iconBook,
	iconBug,
	iconCloud,
	iconCommand,
	iconDiscord,
	iconEmail,
	iconQuery,
	iconSidekick,
	iconSurreal,
	iconSurrealist,
	iconVideo,
} from "~/util/icons";

import { Box, SimpleGrid, Stack, UnstyledButton } from "@mantine/core";
import { Text } from "@mantine/core";
import { closeAllModals } from "@mantine/modals";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useLocation } from "wouter";
import { adapter } from "~/adapter";
import { useIsAuthenticated, useSurrealCloud } from "~/hooks/cloud";
import { useIsLight } from "~/hooks/theme";
import { openAccountSupport } from "~/screens/cloud-panel/modals/account-support";
import { dispatchIntent } from "~/util/intents";
import { Icon } from "../Icon";
import { PrimaryTitle } from "../PrimaryTitle";

export interface HelpCenterProps {
	onBody?: boolean;
}

export function HelpCenter({ onBody }: HelpCenterProps) {
	const isAuthed = useIsAuthenticated();
	const showCloud = useSurrealCloud();

	const [, navigate] = useLocation();

	return (
		<Stack
			gap={32}
			className={clsx(classes.root, onBody && classes.onBody)}
		>
			<HelpSection title="Community">
				<HelpTile
					title="Discord"
					description="Join our community for support and discussion"
					icon={iconDiscord}
					onClick={() => adapter.openUrl("https://discord.gg/dc4JNWrrMc")}
				/>
				<HelpTile
					title="GitHub"
					description="Star the SurrealDB repo and keep track of development"
					icon={iconAPI}
					onClick={() => adapter.openUrl("https://github.com/surrealdb")}
				/>
				<HelpTile
					title="YouTube"
					description="Stay up-to-date with live streams & video tutorials"
					icon={iconVideo}
					onClick={() => adapter.openUrl("https://www.youtube.com/@SurrealDB")}
				/>
			</HelpSection>
			<HelpSection title="Surrealist">
				<HelpTile
					title="Surrealist Docs"
					description="Learn how to navigate our user interface"
					icon={iconSurrealist}
					onClick={() => adapter.openUrl("https://surrealdb.com/docs/surrealist")}
				/>
				<HelpTile
					title="Keyboard Shortcuts"
					description="Improve productivity & speed up tasks"
					icon={iconCommand}
					onClick={() => dispatchIntent("open-settings", { tab: "keybindings" })}
				/>

				<HelpTile
					title="Issue or Feature Request"
					description="Report bugs or submit a feature request by creating a GitHub issue"
					icon={iconBug}
					onClick={() =>
						adapter.openUrl("https://github.com/surrealdb/surrealist/issues")
					}
				/>
			</HelpSection>
			<HelpSection title="Database">
				<HelpTile
					title="Database Docs"
					description="Examples, guides and tutorials"
					icon={iconSurreal}
					noIconStroke
					onClick={() => adapter.openUrl("https://surrealdb.com/docs")}
				/>
				<HelpTile
					title="University"
					description="Learn the fundamentals of SurrealDB in 3 hours"
					icon={iconQuery}
					onClick={() => adapter.openUrl("https://surrealdb.com/learn/fundamentals")}
				/>
				<HelpTile
					title="Book"
					description="Discover SurrealDB through Aeon's Surreal Renaissance"
					icon={iconBook}
					onClick={() => adapter.openUrl("https://surrealdb.com/learn/book")}
				/>
			</HelpSection>
			{showCloud && (
				<HelpSection title="Cloud">
					<HelpTile
						title="Cloud Docs"
						description="Learn how to set-up, configure and optimise your instances"
						icon={iconCloud}
						onClick={() => adapter.openUrl("https://surrealdb.com/docs/cloud")}
					/>
					<HelpTile
						title="Sidekick"
						description="Chat with your personal Surreal AI assistant"
						icon={iconSidekick}
						onClick={() => navigate("/cloud/chat")}
					/>
					<HelpTile
						title="Account"
						description="Account or billing related issue? Raise a support ticket"
						icon={iconEmail}
						onClick={() => {
							if (isAuthed) {
								openAccountSupport();
							} else {
								navigate("cloud");
							}
						}}
					/>
				</HelpSection>
			)}
		</Stack>
	);
}

interface HelpSectionProps {
	title: string;
}

function HelpSection({ title, children }: PropsWithChildren<HelpSectionProps>) {
	return (
		<Box>
			<PrimaryTitle>{title}</PrimaryTitle>
			<SimpleGrid
				mt="md"
				cols={{
					base: 1,
					lg: 3,
				}}
			>
				{children}
			</SimpleGrid>
		</Box>
	);
}

interface HelpTileProps {
	title: string;
	description: string;
	icon: string;
	noIconStroke?: boolean;
	onClick?: () => void;
}

function HelpTile({ title, description, icon, noIconStroke, onClick }: HelpTileProps) {
	const isLight = useIsLight();

	return (
		<UnstyledButton
			p="lg"
			bg={isLight ? "slate.0" : "slate.9"}
			className={classes.helpTile}
			onClick={() => {
				closeAllModals();
				onClick?.();
			}}
		>
			<Icon
				path={icon}
				c="bright"
				size="lg"
				noStroke={noIconStroke}
				mb="lg"
				mr="md"
			/>
			<Box>
				<Text
					c="bright"
					fw={600}
					fz="lg"
					mt={1}
				>
					{title}
				</Text>
				<Text
					fz="sm"
					mt="xs"
				>
					{description}
				</Text>
			</Box>
		</UnstyledButton>
	);
}
