"use client";
import { UserFilters } from "./user-filters";
import { userFilterDefaults, matchesUser } from "./filter-models";
import { useDeferredValue, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ListLoading } from "@/components/shared/loading";
import {
  FilterToolbar,
  SearchField,
} from "@/components/shared/collection-controls";
import { Badge } from "@/components/ui/badge";
import { AddUser } from "./add-user";
import { AdminTable, adminDate } from "./admin-table";
export function AdminUsers() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.users.directory,
    {},
    { initialNumItems: 20 },
  );
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(userFilterDefaults);
  const [revision, setRevision] = useState(0);
  const deferred = useDeferredValue(search.trim().toLowerCase());
  if (status === "LoadingFirstPage")
    return <ListLoading label="Loading users" />;
  const visible = results.filter(
    (user) =>
      matchesUser(user, filters) &&
      (user.name + " " + user.email + " " + user.phone)
        .toLowerCase()
        .includes(deferred),
  );
  return (
    <>
      <div className="admin-title">
        <div>
          <h1>Users</h1>
          <p>
            Account details and verification. Verification does not indicate
            online activity.
          </p>
        </div>
        <AddUser
          onCreated={() => {
            setSearch("");
            setFilters(userFilterDefaults);
            setRevision((value) => value + 1);
          }}
        />
      </div>
      <FilterToolbar className="mb-5">
        <SearchField
          aria-label="Search loaded users"
          placeholder="Search loaded users by name, email or phone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <UserFilters value={filters} onChange={setFilters} />
      </FilterToolbar>
      <AdminTable
        key={JSON.stringify([revision, deferred, filters])}
        caption="Users"
        rows={visible}
        rowKey={(user) => user.id}
        empty="No loaded users match. Adjust filters or use Next to check more records."
        loadMore={status === "CanLoadMore" ? () => loadMore(20) : undefined}
        loadingMore={status === "LoadingMore"}
        columns={[
          { id: "name", label: "Name", cell: (user) => user.name },
          {
            id: "email",
            label: "Email",
            cell: (user) => user.email || "Not provided",
          },
          {
            id: "phone",
            label: "Phone",
            cell: (user) => user.phone || "Not provided",
          },
          {
            id: "role",
            label: "Role",
            cell: (user) => (
              <Badge variant={user.isAdmin ? "default" : "secondary"}>
                {user.isAdmin ? "Administrator" : "Customer"}
              </Badge>
            ),
          },
          {
            id: "verification",
            label: "Verification",
            cell: (user) => (
              <div className="table-inline-status">
                <span>
                  {user.emailVerified ? "Email verified" : "Email unverified"}
                </span>
                {user.phone && (
                  <div>
                    {user.phoneVerified ? "Phone verified" : "Phone unverified"}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "joined",
            label: "Joined",
            cell: (user) => adminDate.format(user.joinedAt),
          },
        ]}
      />
    </>
  );
}
