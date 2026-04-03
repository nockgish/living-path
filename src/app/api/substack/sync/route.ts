import { NextResponse } from "next/server";
import { syncSubstack } from "@/lib/substack";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

async function authorized(req: Request) {
  // Allow if either: cron secret matches, OR caller is admin
  const url = new URL(req.url);
  const tokenQ = url.searchParams.get("token");
  const tokenH = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && (tokenQ === cronSecret || tokenH === cronSecret)) return true;
  const session = await auth();
  return session?.user?.role === Role.ADMIN;
}

export async function POST(req: Request) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncSubstack();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[substack/sync]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
