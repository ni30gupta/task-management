import { Breadcrumbs, Typography, Link } from "@mui/material";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

// 1. Define a strict interface for the breadcrumb items
interface BreadcrumbItem {
  label: string;
  path?: string; // Made optional since later items don't have paths
}

interface BreadcrumbsComponentProps {
  active_tab?: string;
  mode?: string;
}

export default function BreadcrumbsComponent({ active_tab, mode }: BreadcrumbsComponentProps) {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    // 2. Explicitly type the array so TypeScript allows pushing optional paths
    const crumbs: BreadcrumbItem[] = [{ label: "", path: "" }];

    crumbs.push({ label: 'Test Creation' });

    // 3. Fallback to empty string if mode or active_tab are undefined
    if (mode) crumbs.push({ label: mode });
    if (active_tab) crumbs.push({ label: active_tab });

    return crumbs;
  }, [location.pathname, params, active_tab, mode]); // 4. Added 'mode' to dependency array

  return (
    <Breadcrumbs separator="/" aria-label="breadcrumb">
      {breadcrumbs.map((crumb, index) =>
        // 5. Explicitly check if path is a non-empty string
        crumb.path ? (
          <Link
            key={index}
            component={RouterLink}
            to={crumb.path}
            underline="hover"
            color="primary"
          >
            {crumb.label}
          </Link>
        ) : (
          <Typography variant="subtitle1" key={index} color="text.secondary" sx={{ fontWeight: 500 }}>
            {crumb.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
}
