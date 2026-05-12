import PropTypes from 'prop-types';
import React from 'react';

const CopyFirmNamesButton = ({ data, setMsg }) => (
  <tfoot>
    <tr>
      <td colSpan="100%">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(
              data.map((item) => item.firm_name).filter(Boolean).join('; '),
            );
            setMsg('Názvy firem byly zkopírovány.');
          }}
        >
          Kopírovat názvy firem
        </button>
      </td>
    </tr>
  </tfoot>
);

export default CopyFirmNamesButton;

CopyFirmNamesButton.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    firm_name: PropTypes.string,
  })).isRequired,
  setMsg: PropTypes.func.isRequired,
};
