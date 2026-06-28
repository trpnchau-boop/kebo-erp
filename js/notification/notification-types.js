//notification-types.js

/* =========================
TYPE
========================= */

export const NotificationType = {

  QUOTE: "QUOTE",

  SALE: "SALE",

  IMPORT: "IMPORT",

  EXPORT: "EXPORT",

  TRANSFER: "TRANSFER",

  WARNING: "WARNING",

  SYSTEM: "SYSTEM"

}

/* =========================
ACTION
========================= */

export const NotificationAction = {

  OPEN_QUOTE: "OPEN_QUOTE",

  OPEN_SALE: "OPEN_SALE",

  OPEN_IMPORT: "OPEN_IMPORT",

  OPEN_EXPORT: "OPEN_EXPORT",

  OPEN_TRANSFER: "OPEN_TRANSFER",

  OPEN_URL: "OPEN_URL"

}

/* =========================
STATUS
========================= */

export const NotificationStatus = {

  NEW: "new",

  READ: "read",

  PROCESSING: "processing",

  DONE: "done",

  CANCELLED: "cancelled"

}