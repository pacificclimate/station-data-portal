import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import { textFilterTerms } from "@/utils/text-filter-terms";
import styles from "./ColumnFilters.module.css";

export default function TextTermsColumnFilter({
  column: { Header, filterValue, setFilter },
}) {
  const [terms, setTerms] = useState(() =>
    Array.isArray(filterValue) ? textFilterTerms(filterValue) : [],
  );
  const [draft, setDraft] = useState(() =>
    typeof filterValue === "string" ? filterValue : "",
  );
  const published = useRef(JSON.stringify(textFilterTerms(filterValue)));
  const signature = JSON.stringify(textFilterTerms(filterValue));
  useEffect(() => {
    if (published.current === signature) return;
    published.current = signature;
    setTerms(textFilterTerms(filterValue));
    setDraft("");
  }, [signature, filterValue]);

  const publish = (next) => {
    const values = textFilterTerms(next);
    const key = JSON.stringify(values);
    if (key === published.current) return;
    published.current = key;
    setFilter(values.length ? values : undefined);
  };
  const commit = () => {
    const next = textFilterTerms([...terms, draft]);
    setTerms(next);
    setDraft("");
    publish(next);
  };
  const clear = () => {
    setTerms([]);
    setDraft("");
    publish([]);
  };

  return (
    <div className={styles.textTerms}>
      <span className={styles.textTermsLabel}>Contains any</span>
      {terms.length > 0 && (
        <div className={styles.terms}>
          {terms.map((term) => (
            <span className={styles.term} key={term.toLowerCase()}>
              <span>{term}</span>
              <button
                type="button"
                aria-label={`Remove ${term} from ${Header}`}
                onClick={() => {
                  const next = terms.filter((value) => value !== term);
                  setTerms(next);
                  publish([...next, draft]);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={styles.textTermInput}>
        <Form.Control
          size="sm"
          aria-label={`${Header} contains any`}
          placeholder="Contains any ..."
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            publish([...terms, event.target.value]);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape" && draft) {
              event.preventDefault();
              event.stopPropagation();
              setDraft("");
              publish(terms);
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          aria-label={`Add ${Header} alternative`}
          disabled={!draft.trim()}
          onClick={commit}
        >
          Add
        </Button>
        <Button
          type="button"
          size="sm"
          variant="link"
          className="p-1"
          aria-label={`Clear ${Header} filter`}
          title="Clear filter values"
          disabled={!terms.length && !draft}
          onClick={clear}
        >
          <XCircle aria-hidden="true" />
        </Button>
      </div>
      <span className={styles.textTermsHint}>
        Press Enter or Add for another alternative.
      </span>
    </div>
  );
}
