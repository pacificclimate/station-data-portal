import { Link, useLoaderData } from "react-router-dom";
import Header from "../../main/Header/Header";
import { Container } from "react-bootstrap";

export default function StationPreview() {
  const urlParams = useLoaderData();

  function placeholder() {
    return `This is the variable preview for station ${urlParams.stationId}. Someday there will be graphs and stuff.`;
  }

  return (
    <Container fluid classname="StationPreview">
      {placeholder()}
      <br />
      <Link to={"/"}>Back to main</Link>
    </Container>
  );
}

// returns the id of the selected station from the URL
// the results of this function are accessed via "useLoaderData"
// and it is configured via the router in index.js.
export function loader({ params }) {
  const stationId = params.stationId;
  return { stationId };
}
