import React, { useState } from 'react';
import { Button, Divider, Empty, Input, Select, Table } from 'antd';
import { useInstanceApi } from 'hooks/UseInstanceApi';
import KeyData from 'components/explorer/tools/keydata/KeyData';

function ScanTool() {
    const instanceApi = useInstanceApi();

    const instanceId = instanceApi.selectedExplorerInstanceId;
    const [keys, setKeys] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState(null);
    const [selectedKey, setSelectedKey] = useState(null);

    const executeScan = async value => {
        const parameters = [scanResult ? scanResult[0] : '0', 'MATCH', value, 'COUNT', '1000'];

        if (searchType) {
            parameters.push('TYPE', searchType);
        }

        const result = await instanceApi.executeCommand(instanceId, 'scan', parameters);

        return result;
    }

    const scan = async value => {
        setSearchValue(value);

        if (instanceId) {
            const result = await executeScan(value);
            setScanResult(result);
            setKeys(result[1]);
        }
    };

    const changeSearchType = type => {
        setSearchType(type);
        setScanResult(null);
        setKeys([]);
    }

    const continueScanning = async () => {
        if (instanceId && scanResult) {
            const result = await executeScan(searchValue);
            setScanResult(result);
            setKeys([
                ...keys,
                ...result[1]
            ]);
        }
    }

    if (!instanceId) {
        return (<Empty description="Please select an instance" />);
    }

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: key => <strong>{key}</strong>
        }
    ];

    const dataSource = keys.map(key => ({ key }));

    return (
        <React.Fragment>
            <Input.Search
                placeholder="Key"
                allowClear={true}
                onSearch={value => scan(value)}
                style={{
                    width: 400,
                    marginBottom: 20
                }} />
            <Select
                placeholder="Type"
                allowClear={true}
                onChange={type => changeSearchType(type)}
                style={{
                    width: 120,
                    marginBottom: 20,
                    marginLeft: 10
                }}>
                <Select.Option value="string">string</Select.Option>
                <Select.Option value="list">list</Select.Option>
                <Select.Option value="set">set</Select.Option>
                <Select.Option value="zset">zset</Select.Option>
                <Select.Option value="hash">hash</Select.Option>
                <Select.Option value="stream">stream</Select.Option>
            </Select>
            <Button
                onClick={continueScanning}
                disabled={!scanResult || scanResult[0] === '0'}
                style={{ marginLeft: 10 }}>
                Continue Scanning
            </Button>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: 10,
                    size: 'small'
                }}
                size="small"
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: [selectedKey],
                    onChange: selectedRowKeys => setSelectedKey(selectedRowKeys[0]),
                }} />
            {selectedKey && (
                <React.Fragment>
                    <Divider>Key Data</Divider>
                    <KeyData redisKey={selectedKey} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

export default ScanTool;