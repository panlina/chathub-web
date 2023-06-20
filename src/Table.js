import { useState, useId } from 'react';
export default function Table({
  get, add, _delete, update, rename,
  renderValue, renderValueEdit
}) {
  var [_new, setNew] = useState({ name: '', value: '' });
  var addFormId = useId();
  var [edited, setEdited] = useState();
  var updateFormId = useId();
  var [renamed, setRenamed] = useState();
  var renameFormId = useId();
  return <table>
    {get.isLoading ? <tr><td colSpan={3}>(Loading...)</td></tr> :
      Object.keys(get.data).length ?
        Object.entries(get.data).map(([name, value]) =>
          <tr key={name}>
            <td>{
              renamed && renamed.name == name ?
                <input form={renameFormId} value={renamed.newName} onChange={e => { setRenamed({ ...renamed, newName: e.target.value }); }} disabled={rename.isLoading} /> :
                name
            }</td>
            <td>{
              edited && edited.name == name ?
                renderValueEdit ?
                  renderValueEdit({ form: updateFormId, value: edited.value, onChange: value => { setEdited({ ...edited, value: value }); }, disabled: update.isLoading }) :
                  <input form={updateFormId} value={edited.value} onChange={e => { setEdited({ ...edited, value: e.target.value }); }} disabled={update.isLoading} /> :
                renderValue ? renderValue(value) : value
            }</td>
            <td>
              <button
                onClick={async () => {
                  try { await _delete.mutateAsync(name); }
                  catch (e) { alert(e.response.data); }
                }}
                disabled={add.isLoading || _delete.isLoading || edited || renamed}
              >
                {_delete.isLoading && _delete.variables == name ? "Deleting..." : "❌"}
              </button>
              {
                edited && edited.name == name && !update.isLoading ?
                  <>
                    <button form={updateFormId}>OK</button>
                    <button form={updateFormId} onClick={() => { setEdited(undefined); }}>Cancel</button>
                  </> :
                  <button onClick={() => { setEdited({ name: name, value: value }); }} disabled={add.isLoading || _delete.isLoading || edited || renamed}>{
                    update.isLoading && edited.name == name ? "Updating..." : "🖊"
                  }</button>
              }
              {
                renamed && renamed.name == name && !rename.isLoading ?
                  <>
                    <button form={renameFormId}>OK</button>
                    <button form={renameFormId} onClick={() => { setRenamed(undefined); }}>Cancel</button>
                  </> :
                  <button onClick={() => { setRenamed({ name: name, newName: name }); }} disabled={add.isLoading || _delete.isLoading || edited || renamed}>{
                    rename.isLoading && renamed.name == name ? "Renaming..." : "Rename"
                  }</button>
              }
            </td>
          </tr>
        ) :
        <tr><td colSpan={3}>(Nothing)</td></tr>
    }
    <tr>
      <td><input form={addFormId} value={_new.name} onChange={e => { setNew({ ..._new, name: e.target.value }); }} disabled={add.isLoading} /></td>
      <td><input form={addFormId} value={_new.value} onChange={e => { setNew({ ..._new, value: e.target.value }); }} disabled={add.isLoading} /></td>
      <td><button form={addFormId} disabled={add.isLoading || _delete.isLoading || edited || renamed}>{add.isLoading ? "Adding..." : "➕"}</button></td>
    </tr>
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
  </table>;
}
