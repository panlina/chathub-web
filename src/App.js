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
                <td><code>{value}</code></td>
                <td>
                  <button onClick={() => { deleteApp.mutate(name); }} disabled={deleteApp.isLoading}>{
                    deleteApp.isLoading && deleteApp.variables == name ? "Deleting..." : "❌"
                  }</button>
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
      </table>
    </section>
  </>;
}

export default App;
