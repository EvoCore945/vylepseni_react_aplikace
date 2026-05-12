import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const FetchWrapper = ({
  url,
  fallback = 'Načítám...',
  errorRender,
  render,
}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Chyba ${res.status}`);
        }
        const json = await res.json();
        if (active) {
          setData(json);
        }
      } catch (err) {
        if (active) {
          setError(err);
        }
      }
    };

    loadData();

    return () => {
      active = false; // prevent setting state on unmounted component
    };
  }, [url]);

  if (error && errorRender) {
    return errorRender(error);
  }
  if (error) {
    return (
      <div>
        {error.message}
      </div>
    );
  }
  if (!data) {
    return <div>{fallback}</div>;
  }
  return render(data);
};
FetchWrapper.propTypes = {
  url: PropTypes.string.isRequired,
  fallback: PropTypes.node,
  errorRender: PropTypes.func,
  render: PropTypes.func,
};

export default FetchWrapper;
