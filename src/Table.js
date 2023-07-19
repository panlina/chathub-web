import { useState, useId } from 'react';
import { Button, Input, Table as AntTable } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
export default function Table({
  get, add, _delete, update, rename, action,
  renderValue, renderValueEdit
}) {
  var [_new, setNew] = useState({ name: '', value: '' });
  var addFormId = useId();
  var [edited, setEdited] = useState();
  var updateFormId = useId();
  var [renamed, setRenamed] = useState();
  var renameFormId = useId();
  return <>
    <AntTable
      columns={[{
        title: "Name",
        dataIndex: 'name',
        render: value => renamed && renamed.name == value ?
          <Input form={renameFormId} value={renamed.newName} onChange={e => { setRenamed({ ...renamed, newName: e.target.value }); }} disabled={rename.isLoading} /> :
          value
      }, {
        title: "Source",
        dataIndex: 'value',
        render: (value, { name }) => edited && edited.name == name ?
          renderValueEdit ?
            renderValueEdit({ form: updateFormId, value: edited.value, onChange: value => { setEdited({ ...edited, value: value }); }, disabled: update.isLoading }) :
            <Input form={updateFormId} value={edited.value} onChange={e => { setEdited({ ...edited, value: e.target.value }); }} disabled={update.isLoading} /> :
          renderValue ? renderValue(value) : value
      }, {
        title: "Action",
        render: ({ name, value }) => <>
          <Button
            onClick={async () => {
              try { await _delete.mutateAsync(name); }
              catch (e) { alert(e.response.data); }
            }}
            disabled={add.isLoading || _delete.isLoading || edited || renamed}
            loading={_delete.isLoading && _delete.variables == name}
            danger
            icon={<DeleteOutlined />}
          />
          {
            edited && edited.name == name && !update.isLoading ?
              <>
                <Button form={updateFormId} htmlType={null}>OK</Button>
                <Button form={updateFormId} onClick={() => { setEdited(undefined); }}>Cancel</Button>
              </> :
              <Button onClick={() => { setEdited({ name: name, value: value }); }} disabled={add.isLoading || _delete.isLoading || edited || renamed} loading={update.isLoading && edited.name == name} icon={<EditOutlined />} />
          }
          {
            renamed && renamed.name == name && !rename.isLoading ?
              <>
                <Button form={renameFormId} htmlType={null}>OK</Button>
                <Button form={renameFormId} onClick={() => { setRenamed(undefined); }}>Cancel</Button>
              </> :
              <Button onClick={() => { setRenamed({ name: name, newName: name }); }} disabled={add.isLoading || _delete.isLoading || edited || renamed} loading={rename.isLoading && renamed.name == name}>Rename</Button>
          }
          {action.map(action => action(value, name, { disabled: add.isLoading || _delete.isLoading || edited || renamed }))}
        </>
      }]}
      rowKey="name"
      dataSource={get.data ? Object.entries(get.data).map(([name, value]) => ({ name, value })) : undefined}
      loading={get.isLoading}
      summary={data => <AntTable.Summary.Row>
        <AntTable.Summary.Cell>
          <Input form={addFormId} value={_new.name} onChange={e => { setNew({ ..._new, name: e.target.value }); }} disabled={add.isLoading} />
        </AntTable.Summary.Cell>
        <AntTable.Summary.Cell>{
          renderValueEdit ?
            renderValueEdit({ form: addFormId, value: _new.value, onChange: value => { setNew({ ..._new, value: value }); }, disabled: add.isLoading }) :
            <Input form={addFormId} value={_new.value} onChange={e => { setNew({ ..._new, value: e.target.value }); }} disabled={add.isLoading} />
        }</AntTable.Summary.Cell>
        <AntTable.Summary.Cell>
          <Button form={addFormId} htmlType={null} disabled={add.isLoading || _delete.isLoading || edited || renamed} loading={add.isLoading} icon={<PlusOutlined />} />
        </AntTable.Summary.Cell>
      </AntTable.Summary.Row>}
    />
    <form id={addFormId} onSubmit={async e => {
      e.preventDefault();
      try {
        await add.mutateAsync(_new);
        setNew({ name: '', value: '' });
      } catch (e) {
        alert(e.response.data);
      }
    }} />
    <form id={updateFormId} onSubmit={async e => {
      e.preventDefault();
      try {
        await update.mutateAsync(edited);
        setEdited(undefined);
      } catch (e) {
        alert(e.response.data);
      }
    }} />
    <form id={renameFormId} onSubmit={async e => {
      e.preventDefault();
      try {
        await rename.mutateAsync(renamed);
        setRenamed(undefined);
      } catch (e) {
        alert(e.response.data);
      }
    }} />
  </>;
}
