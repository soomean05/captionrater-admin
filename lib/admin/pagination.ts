/** Global page size for all admin list views (server-side range). */
export const ADMIN_PAGE_SIZE = 10;

export function parseAdminPage(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(s ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/** Strip `page` and empty values; keep filters (e.g. `error`) for pagination links. */
export function adminPaginationPreserve(
  sp: Record<string, string | string[] | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (v === undefined || v === null) continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined && val !== "") out[k] = val;
  }
  return out;
}

export function getAdminListPagination(
  sp: Record<string, string | string[] | undefined>
) {
  return {
    page: parseAdminPage(sp.page),
    pageSize: ADMIN_PAGE_SIZE,
    preserve: adminPaginationPreserve(sp),
  };
}
