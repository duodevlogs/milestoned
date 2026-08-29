import "server-only";

import { z } from "zod";
import { portalOtpService } from "@/server/services/portal-otp.service";
import { projectRepository } from "@/server/repositories/project.repository";
import { requestPortalOtpSchema, verifyPortalOtpSchema } from "@/server/validation/portal-auth.schema";
import { AppError } from "@/server/errors";

const projectIdSchema = z.uuid({ message: "Invalid project id." });

export const portalAuthController = {
  async requestOtp(rawProjectId: unknown, raw: unknown): Promise<void> {
    const projectId = projectIdSchema.parse(rawProjectId);
    const { email } = requestPortalOtpSchema.parse(raw);

    // Project ids are unguessable UUIDs, unlike an invited email — 404 here
    // doesn't enable meaningful enumeration the way confirming an email
    // would (that's why requestCode itself stays silent on email match).
    const project = await projectRepository.getById(projectId);
    if (!project) {
      throw AppError.notFound("Project not found.", "project_not_found");
    }

    await portalOtpService.requestCode(projectId, email, project.name);
  },

  /** Returns the signed session token — the route sets it as a cookie, not this layer (cookies() is request-context-bound). */
  async verifyOtp(rawProjectId: unknown, raw: unknown): Promise<string> {
    const projectId = projectIdSchema.parse(rawProjectId);
    const { email, code } = verifyPortalOtpSchema.parse(raw);
    return portalOtpService.verifyCode(projectId, email, code);
  },
};
