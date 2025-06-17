import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_KEY = "v5_unJTqruXV_x-5uj0dT5_Q4QAPThJbXzC2MmOQ";
const ZONE_ID = "2ce8a2f880534806e2f463e3eec68d31";
const USERNAME = "Saaatya12s%&";
const PASSWORD = "HrosgIgrgptQVBmP";

export default function Admin() {
  const [records, setRecords] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [editing, setEditing] = useState({});
  const [auth, setAuth] = useState({ username: "", password: "" });

  const login = () => {
    if (
      auth.username === USERNAME &&
      auth.password === PASSWORD
    ) {
      setIsLogged(true);
    } else {
      alert("Login gagal!");
    }
  };

  const fetchRecords = () => {
    fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setRecords(data.result || []));
  };

  const deleteRecord = (id) => {
    fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }).then(() => fetchRecords());
  };

  const updateRecord = (id) => {
    const record = records.find((r) => r.id === id);
    fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...record,
        content: editing[id].content,
        type: editing[id].type,
      }),
    }).then(() => {
      setEditing((e) => ({ ...e, [id]: undefined }));
      fetchRecords();
    });
  };

  useEffect(() => {
    if (isLogged) fetchRecords();
  }, [isLogged]);

  if (!isLogged) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card className="p-6 space-y-4 w-full max-w-md">
          <CardContent>
            <input
              placeholder="Username"
              value={auth.username}
              onChange={(e) => setAuth((a) => ({ ...a, username: e.target.value }))}
              className="w-full border p-2 rounded mb-2"
            />
            <input
              placeholder="Password"
              type="password"
              value={auth.password}
              onChange={(e) => setAuth((a) => ({ ...a, password: e.target.value }))}
              className="w-full border p-2 rounded mb-2"
            />
            <Button className="w-full" onClick={login}>Login Admin</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Panel Admin - FreeSubdo</h1>
      <table className="w-full table-auto border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Subdomain</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Target</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.name}</td>
              <td className="border px-2 py-1">
                <input
                  value={editing[r.id]?.type || r.type}
                  onChange={(e) =>
                    setEditing((e2) => ({
                      ...e2,
                      [r.id]: { ...editing[r.id], type: e.target.value },
                    }))
                  }
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  value={editing[r.id]?.content || r.content}
                  onChange={(e) =>
                    setEditing((e2) => ({
                      ...e2,
                      [r.id]: { ...editing[r.id], content: e.target.value },
                    }))
                  }
                />
              </td>
              <td className="border px-2 py-1">
                <Button
                  onClick={() => updateRecord(r.id)}
                  className="mr-2"
                >
                  Simpan
                </Button>
                <Button
                  onClick={() => deleteRecord(r.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}