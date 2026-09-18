import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme, alpha } from "@mui/material/styles";
import { LAYOUT } from "@/Utils/Theme/constants";
import { typographyLevels } from "@/Utils/Theme/Palette";

export const Severities = ["info", "warning", "error"] as const;
export type Severity = (typeof Severities)[number];

const SEVERITY_GLYPH: Record<Severity, string> = {
	info: "ⓘ",
	warning: "⚠",
	error: "✕",
};

interface NoticeBannerProps {
	severity?: Severity;
	children: React.ReactNode;
	action?: React.ReactNode;
}

export const NoticeBanner = ({
	severity = "info",
	children,
	action,
}: NoticeBannerProps) => {
	const theme = useTheme();
	const tone = theme.palette[severity].main;
	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			alignItems={{ xs: "stretch", sm: "center" }}
			gap={theme.spacing(LAYOUT.SM)}
			width={"100%"}
			p={theme.spacing(LAYOUT.MD)}
			borderRadius={theme.shape.borderRadius}
			border={`1px solid ${alpha(tone, 0.45)}`}
			bgcolor={alpha(tone, 0.08)}
			textAlign={"left"}
		>
			<Stack
				direction="row"
				alignItems="flex-start"
				gap={theme.spacing(LAYOUT.SM)}
				flex={1}
			>
				<Box
					component="span"
					color={tone}
					fontSize={typographyLevels.xl}
					lineHeight={1}
					mt={LAYOUT.XXS}
					aria-hidden
				>
					{SEVERITY_GLYPH[severity]}
				</Box>
				<Typography
					color={theme.palette.text.primary}
					lineHeight={1.55}
				>
					{children}
				</Typography>
			</Stack>
			{action && <Box flexShrink={0}>{action}</Box>}
		</Stack>
	);
};
