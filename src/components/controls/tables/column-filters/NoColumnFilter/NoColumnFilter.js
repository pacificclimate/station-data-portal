import React from 'react';
import Form from 'react-bootstrap/Form';
import ClearButton from '../../misc/ClearButton';
import { filterName } from '../../filterTypes';
import styles from '../ColumnFilters.module.css';

// Default UI for column filtering
export default function NoColumnFilter({
  size,
}) {
  return (
    <div className={`${styles.wrapper} ${styles.default}`}>
      <Form.Text muted>No filter - use Station Filters and Map</Form.Text>
    </div>
  );
}


