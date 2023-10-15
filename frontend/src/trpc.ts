import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../backend/src/api/router";

export const trpc = createTRPCReact<AppRouter>();
