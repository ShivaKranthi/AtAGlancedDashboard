import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Limit pool size to avoid exhausting Supabase local connections
const client = postgres(connectionString, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
});

export const db = drizzle(client, { schema });
