import { useEffect, useState } from "react";
import api from "../api";
import "../css/Home.css";
import { useNavigate } from "react-router";

const Home = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByMatching, setFilterByMatching] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "student";
  const isTutor = userRole === "tutor";

  // ✅ FIXED: correct fields
  const myInterests = isTutor
    ? user?.skills || []
    : user?.helpNeeded || [];

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint = isTutor ? "/students" : "/tutors";
        const res = await api.get(endpoint);
        setPeople(res.data);
      } catch (err) {
        console.error("API ERROR:", err);
        setError("Unable to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isTutor]);

  /* ================= FILTER ================= */
  const filteredList = people.filter((person) => {
    const subjects = isTutor
      ? person.helpNeeded || []
      : person.skills || [];

    const searchMatch =
      !searchTerm ||
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjects.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (!filterByMatching) return searchMatch;

    return (
      searchMatch &&
      subjects.some((s) =>
        myInterests.some(
          (i) => i.toLowerCase() === s.toLowerCase()
        )
      )
    );
  });

  if (loading) return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="logo">PeerSeeker</div>
        <div className="nav-right">
          Welcome, <strong>{user?.name}</strong> ({userRole})
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>
          {isTutor
            ? "Empower students, share your knowledge."
            : "Inspire hope, ignite the imagination."}
        </h1>

        <input
          type="text"
          placeholder={
            isTutor
              ? "Search students by name or need..."
              : "Search tutors by name or skill..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✅ BUTTON GUARANTEED TO SHOW */}
        {myInterests.length > 0 && (
          <button
            onClick={() => setFilterByMatching((prev) => !prev)}
            className="filter-toggle-btn"
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #2563eb",
              background: filterByMatching ? "#2563eb" : "white",
              color: filterByMatching ? "white" : "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {filterByMatching
              ? "Show All"
              : isTutor
              ? "Show Students I Can Help"
              : "Show Tutors For My Needs"}
          </button>
        )}
      </section>

      {/* ================= RESULTS ================= */}
      <section className="recommended">
        <div className="student-grid">
          {filteredList.length === 0 ? (
            <p>No results found</p>
          ) : (
            filteredList.map((person) => (
              <div
                key={person._id}
                className="student-card"
                onClick={() =>
                  navigate(
                    isTutor
                      ? `/student/${person._id}`
                      : `/tutor/${person._id}`
                  )
                }
              >
                <p className="student-name">{person.name}</p>
                <p className="student-course">
                  {person.course} — Year {person.year}
                </p>
                <p className="student-skills">
                  {isTutor
                    ? `Needs help in: ${person.helpNeeded?.join(", ")}`
                    : `Skills: ${person.skills?.join(", ")}`}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
