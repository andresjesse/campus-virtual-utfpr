import { Link } from "react-router";

export function Home() {
  return (
    <main>
      <h1>Home</h1>
      <Link to="/admin">Admin</Link>
    </main>
  );
}
