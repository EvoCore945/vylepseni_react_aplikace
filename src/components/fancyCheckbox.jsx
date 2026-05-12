import PropTypes from 'prop-types';
import React from 'react';

const FancyCheckbox = ({
  checked,
  defaultChecked,
  onChange,
  children,
  id,
  name,
  value,
  disabled,
  required,
  className,
  style,
  ariaLabel,
}) => {
  const inputId = id ?? `cb-${Math.random().toString(36).slice(2)}`;
  const isControlled = typeof checked === 'boolean';

  return (
    <label
      className={`fancy-checkbox${className ? ` ${className}` : ''}`}
      htmlFor={inputId}
      style={style}
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        value={value}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        onChange={onChange}
        checked={isControlled ? checked : undefined}
        defaultChecked={!isControlled ? defaultChecked : undefined}

      />
      <span className="box" aria-hidden="true" />
      {children != null && <span className="label">{children}</span>}
    </label>
  );
};
export default FancyCheckbox;

FancyCheckbox.propTypes = {
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.node,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.node,
  ariaLabel: PropTypes.string,
};

FancyCheckbox.defaultProps = {
  checked: undefined,
  defaultChecked: undefined,
  onChange: undefined,
  children: null,
  id: undefined,
  name: undefined,
  value: undefined,
  disabled: false,
  required: false,
  className: '',
  style: undefined,
  ariaLabel: undefined,
};
