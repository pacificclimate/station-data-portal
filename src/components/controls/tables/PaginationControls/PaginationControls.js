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
  pageSizes = [10, 15, 20, 30, 50],
  size = 'sm',
  variant = 'light',
  ...restOfProps
}) {
  const buttonProps = { variant };
  return (
      <ButtonToolbar {...restOfProps}>
        <ButtonGroup className={styles.fwdBack} size={size}>
          <Button
            title="Go to first page"
            {...buttonProps}
            disabled={!canPreviousPage}
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
            Page
            <span className={styles.pageCount}>{pageIndex + 1}</span>
            of
            <span className={styles.pageCount}>{pageCount}</span>
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
            disabled={!canNextPage}
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
            as="select"
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
          <InputGroup.Text>
            rows per page
          </InputGroup.Text>
        </InputGroup>
      </ButtonToolbar>
  );
}
