import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Input, Layout, theme } from 'antd';
import Table from './Table';
import './App.css';
function App() {
  var queryClient = useQueryClient();
  var { token } = theme.useToken();
  return <Layout>
    <Layout.Header style={{ backgroundColor: token.colorBgContainer }}>
      <h1>Chathub</h1>
    </Layout.Header>
    <Layout.Content>
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
          action={[
            (value, name, { disabled }) => <Button onClick={async () => {
              var response = await axios.get(`/app/${name}/error`);
              alert(
                response.data
                  .map(error => `${new Date(error.time).toLocaleString()}\t${error.error}`)
                  .join('\n')
              );
            }} disabled={disabled}>Error log</Button>
          ]}
          renderValue={value => <pre className="code-block"><code>{value}</code></pre>}
          renderValueEdit={({ form, value, onChange, disabled }) => <Input.TextArea form={form} value={value} onChange={e => { onChange(e.target.value); }} disabled={disabled} />}
        />
      </section>
    </Layout.Content>
  </Layout>;
}

export default App;
