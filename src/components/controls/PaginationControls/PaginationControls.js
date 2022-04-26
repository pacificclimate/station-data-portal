import React from 'react';
import {
  Button, ButtonToolbar, ButtonGroup, InputGroup, FormControl
} from 'react-bootstrap';
import {
  SkipBackward, SkipEnd, SkipForward, SkipStart
} from 'react-bootstrap-icons';
import styles from './PaginationControl.module.css';


export default function PaginationControls({
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  gotoPage,
  nextPage,
  previousPage,
  pageSize,
  setPageSize,
  pageSizes = [10, 15, 20, 30],
  size = 'sm',
  style = 'default'
}) {
  const buttonProps = { bsSize: size, bsStyle: style };
  return (
      <ButtonToolbar>
        <ButtonGroup className={styles.fwdBack}>
          <Button
            title="Go to first page"
            {...buttonProps}
            onClick={() => gotoPage(0)}
          >
            <SkipBackward/>
          </Button>
          <Button
            title="Go to previous page"
            {...buttonProps}
            disabled={!canPreviousPage}
            onClick={previousPage}
          >
            <SkipStart/>
          </Button>
          <Button
            {...buttonProps}
            variant={'outline-dark'}
            disabled
          >
            Page {pageIndex + 1} of {pageCount}
          </Button>
          <Button
            title="Go to next page"
            {...buttonProps}
            disabled={!canNextPage}
            onClick={nextPage}
          >
            <SkipEnd/>
          </Button>
          <Button
            title="Go to last page"
            {...buttonProps}
            onClick={() => gotoPage(pageCount - 1)}
          >
            <SkipForward/>
          </Button>
        </ButtonGroup>
        <InputGroup
          className={styles.perPage}
          size={size}
        >
          <FormControl
            className={`text-primary ${styles.perPage}`}
            bsSize={size}
            componentClass="select"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
          >
            {
              pageSizes.map(pgSize => (
                  <option key={pgSize} value={pgSize}>
                     {pgSize}
                  </option>
              ))
            }
          </FormControl>
          <InputGroup.Addon>
            rows per page
          </InputGroup.Addon>
        </InputGroup>
      </ButtonToolbar>
  );
}
