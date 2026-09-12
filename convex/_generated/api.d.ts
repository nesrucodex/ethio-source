/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as catalog from "../catalog.js";
import type * as crons from "../crons.js";
import type * as env from "../env.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_photos from "../lib/photos.js";
import type * as orders from "../orders.js";
import type * as passwordReset from "../passwordReset.js";
import type * as payments from "../payments.js";
import type * as productImages from "../productImages.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  catalog: typeof catalog;
  crons: typeof crons;
  env: typeof env;
  http: typeof http;
  integrations: typeof integrations;
  "lib/access": typeof lib_access;
  "lib/photos": typeof lib_photos;
  orders: typeof orders;
  passwordReset: typeof passwordReset;
  payments: typeof payments;
  productImages: typeof productImages;
  seed: typeof seed;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
