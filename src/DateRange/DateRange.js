import React from 'react';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ago, ahead } from './computeDays';
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";

export const DateRange = ({startDay, endDay, setStartDay, setEndDay}) => {
    return (
        <>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <Button onClick={() => {
                        setStartDay(ago(startDay, 7));
                        setEndDay(ago(endDay, 7));
                        }}
                    >
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </Button>
                </div>
                <div>
                    <Button onClick={() => {
                        setEndDay(ahead(endDay, 7));
                        setStartDay(ahead(startDay, 7));
                    }}
                    >
                        <FontAwesomeIcon icon={faCaretRight} />
                    </Button>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>Start Day: {new Date(startDay).toLocaleString()}</div>
                <div>End Day: {new Date(endDay).toLocaleString()}</div>
            </div>
        </>
    );
};