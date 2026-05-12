import PropTypes from 'prop-types';
import React from 'react';

const FileUpload = ({ setFile }) => {
  // const [base64, setBase64] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      // setBase64(reader.result);
      setFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;

FileUpload.propTypes = {
  setFile: PropTypes.func.isRequired,
};
