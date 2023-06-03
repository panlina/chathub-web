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
  return <>
    <h1>Chathub</h1>
    <section>
      <h2>app</h2>
      <table>
        {app.isLoading ? <tr><td colSpan={3}>(Loading...)</td></tr> :
          Object.keys(app.data).length ?
            Object.entries(app.data).map(([name, value]) =>
              <tr key={name}>
                <td>{name}</td>
                <td>{
                  editedApp && editedApp.name == name ?
                    <input form="update-app" value={editedApp.value} onChange={e => { setEditedApp({ ...editedApp, value: e.target.value }); }} /> :
                    <code>{value}</code>
                }</td>
                <td>
                  <button onClick={() => { deleteApp.mutate(name); }} disabled={deleteApp.isLoading || editedApp && editedApp.name == name}>{
                    deleteApp.isLoading && deleteApp.variables == name ? "Deleting..." : "❌"
                  }</button>
                  {
                    editedApp && editedApp.name == name && !updateApp.isLoading ?
                      <>
                        <button form="update-app">OK</button>
                        <button form="update-app" onClick={() => { setEditedApp(undefined); }}>Cancel</button>
                      </> :
                      <button onClick={() => { setEditedApp({ name: name, value: value }); }} disabled={editedApp || deleteApp.isLoading && deleteApp.variables == name}>{
                        updateApp.isLoading && editedApp.name == name ? "Updating..." : "🖊"
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
          <td><button form="add-app" disabled={addApp.isLoading}>{addApp.isLoading ? "Adding..." : "➕"}</button></td>
        </tr>
        <form id="add-app" onSubmit={async e => {
          e.preventDefault();
          await addApp.mutateAsync();
          setNewApp({ name: '', value: '' });
        }} />
        <form id="update-app" onSubmit={async e => {
          e.preventDefault();
          await updateApp.mutateAsync();
          setEditedApp(undefined);
        }} />
      </table>
    </section>
  </>;
}

export default App;
