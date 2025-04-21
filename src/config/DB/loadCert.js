import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// modulejs work around
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCACert() {
    // Render mounts secret files at /etc/secrets/<name>
    const renderPath = "/etc/secrets/ca.pem";
    if (fs.existsSync(renderPath)) {
        return fs.readFileSync(renderPath, "utf8");
    }
    // Fallback to local cert bundle
    const localPath = path.resolve(__dirname, "./certs/ca.pem");
    if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath, "utf8");
    }
    throw new Error(`CA cert not found in ${renderPath} or ${localPath}`);
}
