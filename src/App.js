import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
function App() {
  var app = useQuery(['app'], async () => (await axios.get("/app")).data);
  return <>
    <h1>Chathub</h1>
    <section>
      <h2>app</h2>
      <table>
        {app.isLoading ? <tr><td colSpan={2}>(Loading...)</td></tr> :
          Object.keys(app.data).length ?
            Object.entries(app.data).map(([name, value]) =>
              <tr key={name}>
                <td>{name}</td>
                <td><code>{value}</code></td>
              </tr>
            ) :
            <tr><td colSpan={2}>(No apps)</td></tr>
        }
      </table>
    </section>
  </>;
}

export default App;
