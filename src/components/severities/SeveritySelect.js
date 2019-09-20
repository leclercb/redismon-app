import React from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';
import Icon from 'components/common/Icon';
import { useSeverityApi } from 'hooks/UseSeverityApi';

export const SeveritySelect = React.forwardRef(function SeveritySelect(props, ref) {
    const severityApi = useSeverityApi();
    const value = severityApi.severities.find(severity => severity.id === props.value) ? props.value : null;

    return (
        <Select ref={ref} allowClear={true} {...props} value={value}>
            {severityApi.severities.map(severity => (
                <Select.Option key={severity.id} value={severity.id}>
                    <Icon icon="circle" color={severity.color} text={severity.title} />
                </Select.Option>
            ))}
        </Select>
    );
});

SeveritySelect.displayName = 'ForwardRefSeveritySelect';

SeveritySelect.propTypes = {
    value: PropTypes.string
};

export default SeveritySelect;