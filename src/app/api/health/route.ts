import { db } from "@/db";
import { captureError } from "@/lib/monitoring/sentry";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) {
    return Response.json({
      ok: true,
      database: false,
      message: "Database not configured",
    });
  }

  try {
    await db.execute(sql`select 1`);

    return Response.json({
      ok: true,
      database: true,
    });
  } catch (error) {
    captureError(error);

    return Response.json(
      {
        ok: false,
        database: true,
      },
      { status: 500 }
    );
  }
}