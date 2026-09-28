import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import logger from "@/logger";

afterEach(cleanup);

// Silence component logging in CI test runs; CI=log turns it back on.
logger.configure({ active: !process.env.CI || process.env.CI === "log" });
