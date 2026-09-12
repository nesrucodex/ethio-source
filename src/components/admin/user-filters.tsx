"use client";
import { FormSection } from "@/components/shared/form-section";
import { ListFilters, FilterSelect } from "./list-filters";
import { activeFilterCount, userFilterDefaults } from "./filter-models";
export function UserFilters({
  value,
  onChange,
}: {
  value: typeof userFilterDefaults;
  onChange: (value: typeof userFilterDefaults) => void;
}) {
  const set = (key: keyof typeof value, next: string) =>
    onChange({ ...value, [key]: next });
  return (
    <ListFilters
      count={activeFilterCount(value)}
      onReset={() => onChange(userFilterDefaults)}
    >
      <FormSection>
        <FilterSelect
          label="Role"
          value={value.role}
          onChange={(v) => set("role", v)}
          options={[
            { value: "all", label: "All roles" },
            { value: "admin", label: "Administrator" },
            { value: "customer", label: "Customer" },
          ]}
        />
        <FilterSelect
          label="Email"
          value={value.email}
          onChange={(v) => set("email", v)}
          options={[
            { value: "all", label: "Any verification" },
            { value: "verified", label: "Verified" },
            { value: "unverified", label: "Unverified" },
          ]}
        />
        <FilterSelect
          label="Phone"
          value={value.phone}
          onChange={(v) => set("phone", v)}
          options={[
            { value: "all", label: "Any phone status" },
            { value: "verified", label: "Verified" },
            { value: "unverified", label: "Unverified" },
            { value: "missing", label: "Not provided" },
          ]}
        />
      </FormSection>
    </ListFilters>
  );
}
