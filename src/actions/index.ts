/**
 * Central export file for all server actions.
 * All actions use a unified wrapper from action-factory.
 * 
 * Note: Individual files have "use server" at the top.
 * This file does not have "use server" to avoid Next.js restrictions 
 * on exporting non-function objects if we ever need them, 
 * although currently we just re-export functions.
 */

// ============== PUBLIC ACTIONS ==============

export * from "./public/auth";
export * from "./public/bookings";
export * from "./public/drafts";
export * from "./public/extras";
export * from "./public/locations";
export * from "./public/nif";
export * from "./public/simulate-payment";
export * from "./public/state";
export * from "./public/transfers";
export * from "./public/search/cars";
export * from "./public/users";

// ============== PRIVATE/ADMIN ACTIONS ==============

export * from "./private/auth/actions";
export * from "./private/bookings/actions";
export * from "./private/cars/actions";
export * from "./private/catalog/actions";

export * from "./private/clients/actions";
export * from "./private/team/actions";

export * from "./private/partners/actions";
export * from "./private/roles/actions";
export * from "./private/stats/actions";
export * from "./private/users/actions";
