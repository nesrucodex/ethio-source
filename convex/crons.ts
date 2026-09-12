import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.daily(
  "Supplier inventory",
  { hourUTC: 2, minuteUTC: 0 },
  internal.integrations.sync,
  { kind: "supplier" },
);
crons.daily(
  "Exchange rates",
  { hourUTC: 1, minuteUTC: 0 },
  internal.integrations.sync,
  { kind: "rates" },
);
export default crons;
