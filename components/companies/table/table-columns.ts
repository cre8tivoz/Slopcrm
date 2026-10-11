export const TABLE_COLUMNS = [
  { key: "name", label: "Company", className: "justify-start" },
  { key: "stage", label: "Stage", className: "justify-start" },
  { key: "owner", label: "Owner", className: "justify-start" },
  {
    key: "pipelineValue",
    label: "Deal value",
    className: "justify-end tabular-nums",
  },
  {
    key: "winProbability",
    label: "Chance to win",
    className: "justify-end tabular-nums",
  },
  { key: "trend", label: "Last 14 weeks", className: "justify-center" },
  { key: "lastInteraction", label: "Last contact", className: "justify-start" },
] as const;

export type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

export const TABLE_GRID_CLASS =
  "grid min-w-max grid-cols-[minmax(max-content,1.4fr)_repeat(6,max-content)] justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex items-center first:pl-6 last:pr-6";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
