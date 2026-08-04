import { z } from "zod";

export const creditPackageIdSchema = z.enum(["small", "large"]);
