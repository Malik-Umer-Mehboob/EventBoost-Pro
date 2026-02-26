/**
 * Vercel Serverless Entry Point
 *
 * This file is the handler Vercel invokes for every request routed to
 * /api/*.  It simply re-exports the Express app from server.js — the app
 * already handles lazy DB initialisation and skips Socket.io / cron / seed
 * when IS_SERVERLESS (process.env.VERCEL === '1') is true.
 *
 * NOTE: This file MUST live at <root>/api/index.js  (i.e. one level above
 * the backend/ folder), matching the "dest" in vercel.json.
 */

const app = require('../backend/server');

module.exports = app;