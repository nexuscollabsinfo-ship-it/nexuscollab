import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { otpAuthRouter } from "./otp-auth-router";
import { clientRequestRouter } from "./client-request-router";
import { workerApplicationRouter } from "./worker-application-router";
import { projectRouter } from "./project-router";
import { dashboardRouter } from "./dashboard-router";
import { fileRouter } from "./file-router";
import { uploadRouter } from "./upload-router";
import { userRouter } from "./user-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  otpAuth: otpAuthRouter,
  clientRequest: clientRequestRouter,
  workerApplication: workerApplicationRouter,
  project: projectRouter,
  dashboard: dashboardRouter,
  file: fileRouter,
  upload: uploadRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
