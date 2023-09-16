import React from 'react';
import { XCircle } from 'react-bootstrap-icons';
import styles from './ClearButton.module.css';


export default function ClearButton({
  title = "Clear filter values",
  setFilter,
  ...restProps
}) {
  return (
    <span
      title={title}
      className={`${styles.ClearButton} text-primary`}
      onClick={e => {
        e.stopPropagation();
        setFilter(undefined);
      }}
      {...restProps}
    >
      <XCircle/>
    </span>
  );
}
