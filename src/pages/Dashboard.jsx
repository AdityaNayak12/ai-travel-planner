import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">AI Travel Planner</div>
        <button type="button" className="auth-button auth-button--ghost" onClick={() => logout()}>
          Log out
        </button>
      </header>
      <main className="app-main">
        <h1 className="app-main__title">Your trips</h1>
        <p className="app-main__lede">
          Signed in as <strong>{user?.email ?? "—"}</strong>. Trip list and
          creation will appear here in the next features.
        </p>
      </main>
    </div>
  );
}
