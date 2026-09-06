const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

function configurePrismaProvider() {
  const dbUrl = (process.env.DATABASE_URL || "").trim();
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const targetProvider = isPostgres ? "postgresql" : "sqlite";

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
    console.log(`[prisma-provider] Current provider="${currentProvider}" matches environment (${targetProvider})`);
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
