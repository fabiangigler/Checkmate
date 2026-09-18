import { BasePage, NoticeBanner, Tab, Tabs } from "@/Components/design-elements";
import { Button, Dialog } from "@/Components/inputs";
import { HeaderTimeRange } from "@/Components/common";
import { MonitorStatBoxes, HeaderMonitorControls } from "@/Components/monitors";
import { TabNetwork } from "@/Pages/Infrastructure/Details/Components/TabNetwork";
import { TabOverview } from "@/Pages/Infrastructure/Details/Components/TabOverview";

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGet, usePost } from "@/Hooks/UseApi";
import type {
	DockerDiscoveryResult,
	HardwareDetailsResponse,
	Monitor,
} from "@/Types/Monitor";
import { useIsAdmin } from "@/Hooks/useIsAdmin";
import { useTranslation } from "react-i18next";
import type { DateRange } from "@/Types/Query";

const InfrastructureDetails = () => {
	const { t } = useTranslation();
	const isAdmin = useIsAdmin();

	const { monitorId } = useParams<{ monitorId: string }>();

	const [dateRange, setDateRange] = useState<DateRange>("recent");
	const [selectedTab, setSelectedTab] = useState<number>(0);
	const [isDockerDialogOpen, setIsDockerDialogOpen] = useState(false);

	const monitorDetailsUrl = useMemo(() => {
		if (!monitorId) {
			return null;
		}
		const params = new URLSearchParams();
		params.append("dateRange", dateRange);
		return `/monitors/hardware/details/${monitorId}?${params.toString()}`;
	}, [monitorId, dateRange]);

	const {
		data: monitorDetailsData,
		isLoading: monitorIsLoading,
		refetch: refetchMonitor,
	} = useGet<HardwareDetailsResponse>(
		monitorDetailsUrl,
		{},
		{ refreshInterval: 10000, keepPreviousData: true }
	);

	const { data: dockerDiscovery, refetch: refetchDockerDiscovery } =
		useGet<DockerDiscoveryResult>(
			isAdmin && monitorId ? `/monitors/hardware/${monitorId}/docker-discovery` : null,
			{},
			{ revalidateOnFocus: false }
		);
	const { post: createDockerMonitor, loading: isCreatingDockerMonitor } = usePost<
		Record<string, never>,
		Monitor
	>();

	const monitor = monitorDetailsData?.monitor;
	const monitorStats = monitorDetailsData?.monitorStats ?? null;
	const stats = monitorDetailsData?.stats;
	const showDockerDiscovery =
		isAdmin &&
		dockerDiscovery &&
		!dockerDiscovery.monitorExists &&
		dockerDiscovery.containerCount > 0;

	const handleCreateDockerMonitor = async () => {
		if (!monitorId) return;
		const result = await createDockerMonitor(
			`/monitors/hardware/${monitorId}/docker-monitor`,
			{}
		);
		if (!result?.success) return;
		setIsDockerDialogOpen(false);
		await refetchDockerDiscovery();
	};

	return (
		<BasePage>
			<HeaderMonitorControls
				path="infrastructure"
				monitor={monitor}
				isAdmin={isAdmin}
				refetch={refetchMonitor}
			/>
			<MonitorStatBoxes
				monitor={monitor}
				monitorStats={monitorStats}
			/>
			{showDockerDiscovery && (
				<NoticeBanner
					action={
						<Button
							variant="contained"
							onClick={() => setIsDockerDialogOpen(true)}
							sx={{ whiteSpace: "nowrap" }}
						>
							{t("pages.infrastructure.dockerDiscovery.action")}
						</Button>
					}
				>
					{t("pages.infrastructure.dockerDiscovery.notice", {
						count: dockerDiscovery.containerCount,
					})}
				</NoticeBanner>
			)}
			<HeaderTimeRange
				isLoading={monitorIsLoading}
				hasDateRange={true}
				dateRange={dateRange}
				setDateRange={setDateRange}
			/>
			<Tabs
				value={selectedTab}
				onChange={(_e, value) => {
					setSelectedTab(value);
				}}
			>
				<Tab label={t("pages.infrastructure.tabs.labels.overview")} />
				<Tab label={t("pages.infrastructure.tabs.labels.network")} />
			</Tabs>
			{selectedTab === 0 && (
				<TabOverview
					monitor={monitor}
					stats={stats}
					dateRange={dateRange}
				/>
			)}
			{selectedTab === 1 && (
				<TabNetwork
					stats={stats}
					dateRange={dateRange}
				/>
			)}
			<Dialog
				open={isDockerDialogOpen}
				title={t("pages.infrastructure.dockerDiscovery.dialog.title")}
				content={t("pages.infrastructure.dockerDiscovery.dialog.content", {
					count: dockerDiscovery?.containerCount ?? 0,
				})}
				confirmText={t("pages.infrastructure.dockerDiscovery.action")}
				loading={isCreatingDockerMonitor}
				onConfirm={handleCreateDockerMonitor}
				onCancel={() => setIsDockerDialogOpen(false)}
			/>
		</BasePage>
	);
};

export default InfrastructureDetails;
