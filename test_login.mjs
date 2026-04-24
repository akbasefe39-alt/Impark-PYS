async function test() {
  try {
    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: '123' })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RES:", data);
  } catch (err) {
    console.error("FAIL:", err);
  }
}
test();
