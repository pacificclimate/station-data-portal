import PropTypes from 'prop-types';
import React from 'react';

import CheckboxControl from "../CheckboxControl";
import './IncludeStationsWithNoObsControl.css';

export default function IncludeStationsWithNoObsControl(props) {
  return (
    <CheckboxControl
      label={"Include stations with no observations"}
      {...props}
    />
  )
}

IncludeStationsWithNoObsControl.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// class OnlyWithClimatologyControl extends Component {
//   static propTypes = {
//     value: PropTypes.bool.isRequired,
//     onChange: PropTypes.func.isRequired,
//   };
//
//   render() {
//     const { value, ...rest } = this.props;
//     return (
//       <Form>
//         <Form.Check
//           className={"fw-bold"}
//           label={"Only include stations with climatology"}
//           checked={value}
//           {...rest}
//         />
//       </Form>
//     );
//   }
// }

