import { it, expect } from "vitest";
import React from "react";
import { waitFor } from "@testing-library/react";
import { renderWithProviders, testConfig } from "@/test-utils";
import { configQuery } from "@/state/query-hooks/use-config";
import { useConfigDefaults } from "./use-config-defaults";

const UsesConfigDefaults = () => {
  useConfigDefaults();
  return null;
};

it("applies the loaded config", async () => {
  renderWithProviders(<UsesConfigDefaults />, {
    seedQueries: [
      [
        configQuery().queryKey,
        {
          ...testConfig,
          lethargy: { enabled: false },
          timingEnabled: false,
        },
      ],
    ],
  });
  await waitFor(() => expect(document.title).toBe(testConfig.appTitle));
});
