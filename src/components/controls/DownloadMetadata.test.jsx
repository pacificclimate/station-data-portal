import React from "react";
import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DownloadMetadata from "./DownloadMetadata";
import { smtColumnInfo, smtData } from "@/components/info/column-definitions";

let csv;
vi.mock("react-csv", () => ({
  CSVLink: (props) => {
    csv = props;
    return (
      <button onClick={(event) => props.onClick(event, () => {})}>
        Download
      </button>
    );
  },
}));

it("exports full coordinate precision and every variable despite compact display cells", () => {
  const names = ["Air temperature", "Precipitation", "Snowfall", "Wind speed"];
  const variables = names.map((display_name, index) => ({
    id: index + 1,
    display_name,
  }));
  const stations = [
    {
      id: 1,
      native_id: "TEST",
      histories: [
        {
          id: 1,
          station_name: "Station",
          lon: -123.456789,
          lat: 48.123456,
          elevation: 91.5,
          min_obs_time: new Date("2000-01-01"),
          max_obs_time: new Date("2020-12-31"),
          variable_ids: [1, 2, 3, 4],
        },
      ],
    },
  ];
  const { columns } = smtColumnInfo({
    allNetworks: [],
    allVariables: variables,
    compact: false,
  });
  render(
    <DownloadMetadata data={smtData(stations, false)} columns={columns} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Download" }));
  const values = Object.fromEntries(
    csv.headers.map((header, index) => [header, csv.data[0][index]]),
  );
  expect(values).toMatchObject({
    Longitude: -123.456789,
    Latitude: 48.123456,
    "Elevation (m)": 91.5,
    "Record Start": "2000-01-01",
    "Record End": "2020-12-31",
  });
  expect(values).not.toHaveProperty("Location");
  expect(values).not.toHaveProperty("Record spans");
  expect(values.Variables).toBe(names.join("|"));
});
