import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Table from './Table';
function App() {
  var queryClient = useQueryClient();
  return <>
    <h1>Chathub</h1>
    <section>
      <h2>app</h2>
      <Table
        get={useQuery(['app'], async () => (await axios.get("/app")).data)}
        add={
          useMutation({
            mutationFn: newApp => axios.put(`/app/${newApp.name}`, JSON.stringify(newApp.value), { headers: { 'Content-Type': 'application/json' } }),
            onSuccess: (data, newApp) => { queryClient.setQueryData(['app'], old => (old[newApp.name] = newApp.value, old)) }
          })
        }
        _delete={
          useMutation({
            mutationFn: name => axios.delete(`/app/${name}`),
            onSuccess: (data, name) => { queryClient.setQueryData(['app'], old => (delete old[name], old)) }
          })
        }
        update={
          useMutation({
            mutationFn: editedApp => axios.put(`/app/${editedApp.name}`, JSON.stringify(editedApp.value), { headers: { 'Content-Type': 'application/json' } }),
            onSuccess: (data, editedApp) => { queryClient.setQueryData(['app'], old => (old[editedApp.name] = editedApp.value, old)) }
          })
        }
        rename={
          useMutation({
            mutationFn: renamedApp => axios(`/app/${renamedApp.name}`, { method: 'MOVE', headers: { 'Content-Type': 'application/json', 'Destination': `/app/${encodeURIComponent(renamedApp.newName)}`, 'Overwrite': 'F' } }),
            onSuccess: (data, renamedApp) => { queryClient.setQueryData(['app'], old => { var oldValue = old[renamedApp.name]; delete old[renamedApp.name]; old[renamedApp.newName] = oldValue; return old; }); }
          })
        }
        renderValue={value => <code>{value}</code>}
      />
    </section>
  </>;
}

export default App;
