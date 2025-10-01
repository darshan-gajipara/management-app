export const getPageTitle = (pathname: string) => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/reports") return "Reports";

    // fallback: capitalize last segment
    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "Dashboard";
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
};