import fs from 'fs';
import path from 'path';

// Just run Vite build in a subshell, but wait, `npm run build` failed due to unrelated TS issues.
// Let's use `esbuild` to bundle just the EnterpriseReportViewer to see if it fails on any imports.
