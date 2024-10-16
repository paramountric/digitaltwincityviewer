import { useAppContext } from "../context/AppContext";

export default function Home() {
  const { user, project, projects, features } = useAppContext();

  return (
    <div>
      <h1>Digital Twin City Viewer</h1>
      {user ? (
        <p>Welcome back, user!</p>
      ) : (
        <p>Please log in to access all features.</p>
      )}
    </div>
  );
}
