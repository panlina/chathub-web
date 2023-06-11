import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
function App() {
  var queryClient = useQueryClient();
  var app = useQuery(['app'], async () => (await axios.get("/app")).data);
  var [newApp, setNewApp] = useState({ name: '', value: '' });
  var addApp = useMutation({
    mutationFn: () => axios.put(`/app/${newApp.name}`, JSON.stringify(newApp.value), { headers: { 'Content-Type': 'application/json' } }),
    onSuccess: () => { queryClient.setQueryData(['app'], old => (old[newApp.name] = newApp.value, old)) }
  });
  var deleteApp = useMutation({
    mutationFn: name => axios.delete(`/app/${name}`),
    onSuccess: (data, name) => { queryClient.setQueryData(['app'], old => (delete old[name], old)) }
  });
  var [editedApp, setEditedApp] = useState();
  var updateApp = useMutation({
    mutationFn: () => axios.put(`/app/${editedApp.name}`, JSON.stringify(editedApp.value), { headers: { 'Content-Type': 'application/json' } }),
    onSuccess: () => { queryClient.setQueryData(['app'], old => (old[editedApp.name] = editedApp.value, old)) }
  });
  var [renamedApp, setRenamedApp] = useState();
  var renameApp = useMutation({
    mutationFn: () => axios(`/app/${renamedApp.name}`, { method: 'MOVE', headers: { 'Content-Type': 'application/json', 'Destination': `/app/${encodeURIComponent(renamedApp.newName)}`, 'Overwrite': 'F' } }),
    onSuccess: () => { queryClient.setQueryData(['app'], old => { var oldValue = old[renamedApp.name]; delete old[renamedApp.name]; old[renamedApp.newName] = oldValue; return old; }); }
  });
  return <>
    <h1>Chathub</h1>
    <section>
      <h2>app</h2>
      <table>
        {app.isLoading ? <tr><td colSpan={3}>(Loading...)</td></tr> :
          Object.keys(app.data).length ?
            Object.entries(app.data).map(([name, value]) =>
              <tr key={name}>
                <td>{
                  renamedApp && renamedApp.name == name ?
                    <input form="rename-app" value={renamedApp.newName} onChange={e => { setRenamedApp({ ...renamedApp, newName: e.target.value }); }} /> :
                    name
                }</td>
                <td>{
                  editedApp && editedApp.name == name ?
                    <input form="update-app" value={editedApp.value} onChange={e => { setEditedApp({ ...editedApp, value: e.target.value }); }} /> :
                    <code>{value}</code>
                }</td>
                <td>
                  <button
                    onClick={async () => {
                      try { await deleteApp.mutateAsync(name); }
                      catch (e) { alert(e.response.data); }
                    }}
                    disabled={addApp.isLoading || deleteApp.isLoading || editedApp || renamedApp}
                  >
                    {deleteApp.isLoading && deleteApp.variables == name ? "Deleting..." : "❌"}
                  </button>
                  {
                    editedApp && editedApp.name == name && !updateApp.isLoading ?
                      <>
                        <button form="update-app">OK</button>
                        <button form="update-app" onClick={() => { setEditedApp(undefined); }}>Cancel</button>
                      </> :
                      <button onClick={() => { setEditedApp({ name: name, value: value }); }} disabled={addApp.isLoading || deleteApp.isLoading || editedApp || renamedApp}>{
                        updateApp.isLoading && editedApp.name == name ? "Updating..." : "🖊"
                      }</button>
                  }
                  {
                    renamedApp && renamedApp.name == name && !renameApp.isLoading ?
                      <>
                        <button form="rename-app">OK</button>
                        <button form="rename-app" onClick={() => { setRenamedApp(undefined); }}>Cancel</button>
                      </> :
                      <button onClick={() => { setRenamedApp({ name: name, newName: name }); }} disabled={addApp.isLoading || deleteApp.isLoading || editedApp || renamedApp}>{
                        renameApp.isLoading && renamedApp.name == name ? "Renaming..." : "Rename"
                      }</button>
                  }
                </td>
              </tr>
            ) :
            <tr><td colSpan={3}>(No apps)</td></tr>
        }
        <tr>
          <td><input form="add-app" value={newApp.name} onChange={e => { setNewApp({ ...newApp, name: e.target.value }); }} /></td>
          <td><input form="add-app" value={newApp.value} onChange={e => { setNewApp({ ...newApp, value: e.target.value }); }} /></td>
          <td><button form="add-app" disabled={addApp.isLoading || deleteApp.isLoading || editedApp || renamedApp}>{addApp.isLoading ? "Adding..." : "➕"}</button></td>
        </tr>
        <form id="add-app" onSubmit={async e => {
          e.preventDefault();
          try {
            await addApp.mutateAsync();
            setNewApp({ name: '', value: '' });
          } catch (e) {
            alert(e.response.data);
          }
        }} />
        <form id="update-app" onSubmit={async e => {
          e.preventDefault();
          try {
            await updateApp.mutateAsync();
            setEditedApp(undefined);
          } catch (e) {
            alert(e.response.data);
          }
        }} />
        <form id="rename-app" onSubmit={async e => {
          e.preventDefault();
          try {
            await renameApp.mutateAsync();
            setRenamedApp(undefined);
          } catch (e) {
            alert(e.response.data);
          }
        }} />
      </table>
    </section>
  </>;
}

export default App;
