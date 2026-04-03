import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }
  const sub = await prisma.subscriber.findUnique({ where: { unsubToken: token } });
  if (!sub) {
    return new NextResponse("Invalid token", { status: 404 });
  }
  await prisma.subscriber.update({
    where: { id: sub.id },
    data: { status: "unsubscribed" },
  });

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Unsubscribed</title><meta charset="utf-8"></head>
<body style="margin:0;background:#0a0a1f;color:#f4f4ff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;padding:40px;">
  <div style="font-family:Georgia,serif;font-size:32px;margin-bottom:12px;">Living Path</div>
  <p style="color:#d8d8f0;margin:24px 0 8px;">You have been unsubscribed.</p>
  <p style="color:#6b6b9a;font-size:14px;">May the path keep you well.</p>
</div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
