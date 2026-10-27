import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";
import useConfigContext from "@/state/context-hooks/use-config-context";

export default function NetworkLegend({ onClose }) {
  const config = useConfigContext();
  const { data: networks, isLoading, isError } = useNetworks();
  const selected = useStationsStore((state) => state.selectedNetworks);
  const visible = (networks ?? []).filter(({ uri }) => selected.includes(uri));
  return (
    <aside className="network-legend" aria-label="Network legend">
      <div className="network-legend-heading">
        <strong>Network legend</strong>
        <Button
          variant="link"
          size="sm"
          onClick={onClose}
          aria-label="Close network legend"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      {isLoading ? (
        <Spinner size="sm" animation="border" role="status" />
      ) : isError ? (
        <p>Unable to load networks.</p>
      ) : visible.length === 0 ? (
        <p>No networks selected. Use Filters to show networks.</p>
      ) : (
        visible.map((network) => (
          <details key={network.uri}>
            <summary>
              <span
                className="network-legend-spot"
                style={{
                  backgroundColor: network.color || config.defaultNetworkColor,
                }}
                aria-hidden="true"
              />{" "}
              {network.name}
            </summary>
            <p>
              {network.long_name || network.name}
              {network.station_count != null && (
                <>
                  <br />
                  {network.station_count.toLocaleString()} stations
                </>
              )}
            </p>
          </details>
        ))
      )}
    </aside>
  );
}
