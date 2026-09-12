import type { categoryIds } from "../../../shared/categories";

export const categoryLabels: Record<(typeof categoryIds)[number], string> = {
  electronics: "Electronics",
  fashion: "Fashion & accessories",
  home: "Home & living",
  beauty: "Beauty & care",
  sports: "Sports & outdoors",
  kids: "Kids & baby",
  office: "Office & stationery",
  automotive: "Auto & tools",
};
