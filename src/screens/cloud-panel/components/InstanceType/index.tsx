import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { Icon } from "~/components/Icon";
import type { CloudInstanceType } from "~/types";
import { formatMemory } from "~/util/helpers";
import { iconCheck } from "~/util/icons";
import { Tile } from "../Tile";

export interface InstanceTypeProps {
	type: CloudInstanceType;
	isSelected: boolean;
	isActive?: boolean;
	inactive?: boolean;
	onBody?: boolean;
	onSelect?: (type: string) => void;
}

export function InstanceType({
	type,
	isSelected,
	isActive,
	inactive,
	onBody,
	onSelect,
}: InstanceTypeProps) {
	return (
		<Tile
			isActive={isSelected}
			onClick={onSelect ? () => onSelect(type.slug) : undefined}
			disabled={type.enabled === false || isActive}
			inactive={inactive}
			onBody={onBody}
		>
			<Group
				wrap="nowrap"
				align="center"
			>
				<Stack
					flex={1}
					gap={0}
				>
					<Group>
						<Text
							c="bright"
							fw={600}
							fz="xl"
						>
							{type.display_name}
						</Text>
						{isActive && (
							<Icon
								path={iconCheck}
								c="surreal"
							/>
						)}
					</Group>
				</Stack>
				<Box>
					<Table>
						<Table.Tbody>
							<Table.Tr>
								<Table.Td
									c="bright"
									miw={45}
									ta="right"
								>
									{type.cpu}
								</Table.Td>
								<Table.Td>
									<Group>vCPU</Group>
								</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td
									c="bright"
									miw={45}
									ta="right"
								>
									{formatMemory(type.memory)}
								</Table.Td>
								<Table.Td>
									<Group>Memory</Group>
								</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
				</Box>
			</Group>
		</Tile>
	);
}
