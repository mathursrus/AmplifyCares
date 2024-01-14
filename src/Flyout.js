import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Flyout.css';

function Flyout({Component, onClose}) {

    console.log("Flyout component is ", Component);

    return (
        <div>
            {Component && (
            <div className="flyout show">
                <div className="flyout-header">
                    <FontAwesomeIcon className="flyout-close" icon={faTimes} onClick={onClose}/>
                </div>
                <Component />
            </div>
            )}
        </div>
    )

};

export default Flyout;