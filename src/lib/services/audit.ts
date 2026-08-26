import { db } from "@/lib/db";

interface AuditInput {
  action: string;
  targetType: string;
  targetId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

// Records an administrative/web-important action. Never throws — audit logs
// are best-effort and must not break primary workflows.
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        userId: input.userId ?? null,
        metadata: (input.metadata ?? null) as any,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip");
}
