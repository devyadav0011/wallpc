const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

function getDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  const envFiles = [".env.production", ".env.local", ".env"];
  for (const envFile of envFiles) {
    const filePath = path.join(__dirname, "..", envFile);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return "";
}

function configurePrismaProvider() {
  const dbUrl = getDatabaseUrl();
  const isVercel = Boolean(process.env.VERCEL);
  
  // On Vercel, we always require PostgreSQL
  // Locally, if DATABASE_URL starts with file: or is empty, support SQLite
  const isSqlite = !isVercel && (dbUrl.startsWith("file:") || (!dbUrl && process.env.NODE_ENV !== "production"));
  const targetProvider = isSqlite ? "sqlite" : "postgresql";

  if (!fs.existsSync(schemaPath)) {
    console.error(`[prisma-provider] Schema not found at: ${schemaPath}`);
    return;
  }

  let schema = fs.readFileSync(schemaPath, "utf8");
  const currentProviderMatch = schema.match(/provider\s*=\s*"([^"]+)"/);
  const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

  if (currentProvider !== targetProvider) {
    console.log(`[prisma-provider] Switching Prisma datasource provider: ${currentProvider} -> ${targetProvider}`);
    schema = schema.replace(
      /datasource db \{[\s\S]*?provider\s*=\s*"[^"]+"[\s\S]*?\}/,
      (match) => match.replace(/provider\s*=\s*"[^"]+"/, `provider = "${targetProvider}"`)
    );
    fs.writeFileSync(schemaPath, schema, "utf8");
    console.log(`[prisma-provider] Updated schema.prisma with provider="${targetProvider}"`);
  } else {
    console.log(`[prisma-provider] Current provider="${currentProvider}" matches target (${targetProvider})`);
  }

  // Generate prisma client
  try {
    console.log("[prisma-provider] Running prisma generate...");
    execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });
    console.log("[prisma-provider] Prisma client successfully generated.");
  } catch (err) {
    console.error("[prisma-provider] Failed to run prisma generate:", err.message);
    process.exit(1);
  }
}

configurePrismaProvider();
