import { db } from "@/db";
<<<<<<< HEAD
=======
import { captureError } from "@/lib/monitoring/sentry";
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
<<<<<<< HEAD
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
=======
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
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
