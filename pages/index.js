import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_KEY = "v5_unJTqruXV_x-5uj0dT5_Q4QAPThJbXzC2MmOQ";
const ZONE_ID = "2ce8a2f880534806e2f463e3eec68d31";
const MAX_PER_USER = 3;

const getUserKey = () => {
  if (typeof window === "undefined") return null;
  return btoa(navigator.userAgent + navigator.language);
};

export default function Home() {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const userKey = getUserKey();

  const fetchRecords = () => {
    fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const userRecords = data.result.filter(
            (d) => d.meta?.source === userKey
          );
          setRecords(userRecords);
        }
      });
  };

  const createSubdomain = () => {
    if (!name || !target) return alert("Nama dan Target wajib diisi");
    if (records.length >= MAX_PER_USER)
      return alert("Kamu hanya boleh membuat maksimal 3 subdomain.");

    setLoading(true);

    fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "A",
        name: `${name}.freesubdo.site`,
        content: target,
        ttl: 3600,
        meta: {
          source: userKey,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          alert("Subdomain berhasil dibuat!");
          setName("");
          setTarget("");
          fetchRecords();
        } else {
          alert("Gagal membuat subdomain");
          console.error(data);
        }
      })
      .catch((err) => {
        alert("Terjadi kesalahan saat membuat subdomain");
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (userKey) fetchRecords();
  }, [userKey]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-bold text-center">FreeSubdo - Subdomain Gratis</h1>
          <input
            placeholder="Nama subdomain (misal: aku)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            placeholder="Target IP/domain"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <Button
            className="w-full"
            disabled={loading}
            onClick={createSubdomain}
          >
            {loading ? "Memproses..." : "Buat Subdomain"}
          </Button>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Subdomain Kamu</h2>
            <ul className="list-disc list-inside text-sm">
              {records.map((r) => (
                <li key={r.id}>{r.name} ➝ {r.content}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}