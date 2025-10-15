const urls = ["/login", "/api/teams/list", "/api/orgs/current"];

async function main() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  let ok = true;
  for (const u of urls) {
    const url = `${base}${u}`;
    try {
      const res = await fetch(url, { method: "GET" });
      console.log(`${res.ok ? "✅" : "❌"} ${res.status} ${url}`);
      if (!res.ok) ok = false;
    } catch (e:any) {
      console.log(`❌ ERR ${url} → ${e?.message}`);
      ok = false;
    }
  }
  if (!ok) process.exit(1);
}
main();
