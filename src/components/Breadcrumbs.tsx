import { Breadcrumbs, Typography, Link } from "@mui/material";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  path: string | null;
}

export default function BreadcrumbsComponent({ active_tab, mode }: { active_tab?: string , mode?: string}) {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    const crumbs = [];

    const currentPath = "";
    const formatSegmentLabel = (segment: string, params: Record<string, string | undefined>, active_tab: string| undefined): string => {
      // Handle dynamic routes with parameters
      if (segment === "test-creation" && params.testId) {
        return "Edit Test";
      }
      if (segment === "add-questions" && params.testId) {
        return "Add Questions";
      }
      if (segment === "preview" && params.testId) {
        return "Preview Test";
      }

      return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    
    // pathSegments.forEach((segment, index) => {
    //   currentPath += `/${segment}`;
    //   // Skip the last segment (current page) to avoid duplication
    //   if (index !== pathSegments.length - 1) {
    //     const label = formatSegmentLabel(segment, params, active_tab);
    //     crumbs.push({ label, path: currentPath });
    //   }
    // });

    // Add current page as non-clickable label
    // if (pathSegments.length > 0) {
    //   const currentSegment = pathSegments[pathSegments.length - 1];
    //   const label = formatSegmentLabel(currentSegment, params, active_tab);
    //   crumbs.push({ label: label, path: null });
    // }
    crumbs.push({label:'Test Creation'})
    crumbs.push({label:mode})
    crumbs.push({label:active_tab})
    
    return crumbs;
  }, [location.pathname, params, active_tab]);


  return (
    <Breadcrumbs separator="/" aria-label="breadcrumb" >
      {breadcrumbs.map((crumb, index) =>
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
