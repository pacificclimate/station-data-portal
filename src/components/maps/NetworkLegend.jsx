import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { useNetworks } from "@/state/query-hooks/use-networks";
import { useStationsStore } from "@/state/client/stations-store";
import useConfigContext from "@/state/context-hooks/use-config-context";

function NetworkItem({ network }) {
  const config = useConfigContext();
  return (
    <details>
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
  );
}

function NetworkLegendContents() {
  const { data: networks, isLoading, isError } = useNetworks();
  const selected = useStationsStore((state) => state.selectedNetworks);

  if (isLoading) return <Spinner size="sm" animation="border" role="status" />;
  if (isError) return <p>Unable to load networks.</p>;

  const visible = (networks ?? []).filter(({ uri }) => selected.includes(uri));
  if (visible.length === 0) {
    return <p>No networks selected. Use Filters to show networks.</p>;
  }

  return visible.map((network) => (
    <NetworkItem key={network.uri} network={network} />
  ));
}

export default function NetworkLegend({ onClose }) {
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
      <NetworkLegendContents />
    </aside>
  );
}
