import React, { useEffect, useState } from 'react';
import { Empty, Select } from 'antd';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized';
import Icon from 'components/common/Icon';
import Panel from 'components/common/Panel';
import PromiseButton from 'components/common/PromiseButton';
import { useInstanceApi } from 'hooks/UseInstanceApi';
import { useInstanceStateApi } from 'hooks/UseInstanceStateApi';
import { useSettingsApi } from 'hooks/UseSettingsApi';
import { compareNumbers, compareStrings } from 'utils/CompareUtils';
import { parseRedisSubString } from 'utils/FormatUtils';
import { formatDate } from 'utils/SettingUtils';

function GraphCommands({ instanceId }) {
    const instanceApi = useInstanceApi();
    const instanceStateApi = useInstanceStateApi(instanceId);
    const settingsApi = useSettingsApi();

    const [sortBy, setSortBy] = useState('command');

    useEffect(() => {
        if (!instanceStateApi.lastInfo) {
            instanceApi.getInfo(instanceId);
        }
    }, [instanceId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!instanceStateApi.lastInfo) {
        return (
            <Panel.Sub>
                <Empty description="No data to display" />
            </Panel.Sub>
        );
    }

    const refresh = async () => {
        await instanceApi.getInfo(instanceId);
    };

    const data = Object.keys(instanceStateApi.lastInfo).filter(key => key.startsWith('cmdstat_')).map(key => {
        const cmdStat = parseRedisSubString(instanceStateApi.lastInfo[key]);

        return {
            command: key.substr('cmdstat_'.length),
            calls: Number.parseInt(cmdStat.calls),
            usecPerCall: Number.parseFloat(cmdStat.usec_per_call)
        };
    }).sort((a, b) => {
        switch (sortBy) {
            case 'name': return compareStrings(a.command, b.command);
            case 'calls': return compareNumbers(a.calls, b.calls);
            case 'usecPerCall': return compareNumbers(a.usecPerCall, b.usecPerCall);
            default: return compareStrings(a.command, b.command);
        }
    });

    const cols = {
        command: {
            alias: 'Command'
        },
        calls: {
            alias: 'Calls'
        },
        usecPerCall: {
            alias: 'Microseconds Per Call'
        }
    };

    return (
        <React.Fragment>
            <Panel.Sub>
                <Panel.Standard>
                    <PromiseButton onClick={refresh}>
                        <Icon icon="sync-alt" text={`Refresh (${formatDate(instanceStateApi.lastInfo.timestamp, settingsApi.settings, true)})`} />
                    </PromiseButton>
                    <Select
                        value={sortBy}
                        onChange={value => setSortBy(value)}
                        style={{ width: 300, marginLeft: 20 }}>
                        <Select.Option value="command">Sort by command name</Select.Option>
                        <Select.Option value="calls">Sort by number of calls</Select.Option>
                        <Select.Option value="usecPerCall">Sort by number of microseconds per call</Select.Option>
                    </Select>
                </Panel.Standard>
            </Panel.Sub>
            <Panel.Sub grow>
                <AutoSizer>
                    {({ width, height }) => (
                        <Chart width={width} height={height} data={data} scale={cols} padding="auto" forceFit>
                            <Legend />
                            <Axis
                                name="command"
                                title={{
                                    autoRotate: true,
                                    textStyle: {
                                        fill: 'black',
                                        fontWeight: 'bold'
                                    }
                                }} />
                            <Axis
                                name="calls"
                                position="left"
                                title={{
                                    autoRotate: true,
                                    textStyle: {
                                        fill: 'black',
                                        fontWeight: 'bold'
                                    }
                                }} />
                            <Axis
                                name="usecPerCall"
                                position="right"
                                title={{
                                    autoRotate: true,
                                    textStyle: {
                                        fill: 'black',
                                        fontWeight: 'bold'
                                    }
                                }} />
                            <Tooltip
                                crosshairs={{
                                    type: 'y'
                                }}
                                g2-tooltip={{
                                    width: '200px'
                                }} />
                            <Geom
                                type="interval"
                                position="command*calls"
                                color="#44a2fc" />
                            <Geom
                                type="interval"
                                position="command*usecPerCall"
                                color="#fad34b"
                                opacity={1}
                                size={5} />
                        </Chart>
                    )}
                </AutoSizer>
            </Panel.Sub>
        </React.Fragment>
    );
}

GraphCommands.propTypes = {
    instanceId: PropTypes.string.isRequired
};

export default GraphCommands;