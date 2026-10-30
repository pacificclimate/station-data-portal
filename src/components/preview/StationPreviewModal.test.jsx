import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen, within, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { renderWithProviders } from "@/test-utils";
import StationPreviewModal from "./StationPreviewModal";
import StationPreviewLink from "./StationPreviewLink";
import { useStore } from "@/state/client/state-store";
import { STATION_QUERY_KEY } from "@/state/query-hooks/use-station";
import { STATION_VARIABLES_QUERY_KEY } from "@/state/query-hooks/use-station-variables";

vi.mock("./GraphsBlock", () => ({
  default: () => {
    const stationId = useStore((state) => state.stationId);
    const endDate = useStore((state) => state.selectedEndDate);
    return (
      <div>
        Graphs for {stationId} through {endDate?.getUTCFullYear()}
      </div>
    );
  },
}));
vi.mock("./NavBlock", () => ({
  default: ({ onClose }) => <button onClick={onClose}>Close preview</button>,
}));
const station = {
  id: 42,
  native_id: "TEST",
  histories: [
    {
      id: 1,
      station_name: "Whistler",
      variable_ids: [1],
      min_obs_time: new Date("2000-01-01"),
      max_obs_time: new Date("2020-01-01"),
    },
  ],
};
function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div>Map workspace</div>
      <div>Station table remains mounted</div>
      <output>
        {location.pathname}
        {location.search}
      </output>
      <StationPreviewLink stationId={42}>Preview variables</StationPreviewLink>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <Outlet />
    </>
  );
}
beforeEach(() =>
  useStore.setState({
    stationId: null,
    selectedEndDate: null,
    selectedStartDate: null,
  }),
);
function setup(entry = "/?table=1") {
  renderWithProviders(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<Workspace />}>
          <Route index element={null} />
          <Route path="preview/:stationId" element={<StationPreviewModal />} />
        </Route>
      </Routes>
    </MemoryRouter>,
    {
      seedQueries: [
        [[STATION_QUERY_KEY, "42"], station],
        [
          [STATION_VARIABLES_QUERY_KEY, "42"],
          {
            variables: [
              { id: 1, min_obs_time: "2000-01-01", max_obs_time: "2020-01-01" },
            ],
          },
        ],
      ],
    },
  );
}
it("opens a URL-backed preview and supports Back and Forward without unmounting the workspace", async () => {
  setup();
  const workspace = screen.getByText("Map workspace");
  expect(
    screen.getByRole("link", { name: "Preview variables" }),
  ).toHaveAttribute("href", "/preview/42?table=1");
  fireEvent.click(screen.getByRole("link", { name: "Preview variables" }));
  const modal = await screen.findByRole("dialog", { name: "Variable preview" });
  expect(
    await within(modal).findByText("Graphs for 42 through 2020"),
  ).toBeInTheDocument();
  expect(within(modal).getByText(/Whistler/)).toBeInTheDocument();
  expect(workspace).toBeInTheDocument();
  fireEvent.click(within(modal).getByRole("button", { name: "Close" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Forward" }));
  await screen.findByRole("dialog", { name: "Variable preview" });
});
it("opens a preview deep link directly and closing it keeps the shared table URL", async () => {
  setup("/preview/42?table=1&filters=1");
  const modal = await screen.findByRole("dialog", { name: "Variable preview" });
  await within(modal).findByText("Graphs for 42 through 2020");
  fireEvent.click(within(modal).getByRole("button", { name: "Close preview" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(screen.getByText("/?table=1&filters=1")).toBeInTheDocument();
});
