import { useEffect, useState } from "react";
import api from "../api";
import "../css/Home.css";
import { useNavigate } from "react-router";
import Loading from "./Loading";

const MAX_SEARCH_LENGTH = 30;

const Home = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [filterByMatch, setFilterByMatch] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";
  const isTutor = role === "tutor";

  // Student → helpNeeded, Tutor → skills
  const mySubjects = (isTutor ? user?.skills : user?.helpNeeded || []).map(
    (s) => s.toLowerCase()
  );

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

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format from server");
        }

        setPeople(res.data);
      } catch (err) {
        console.error("API ERROR:", err);
        setError(
          err.response?.data?.message ||
            "Unable to fetch users. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isTutor]);

  /* ================= FILTER LOGIC ================= */
  const trimmedTerm = searchTerm.trim().toLowerCase();

  const filteredPeople = people.filter((person) => {
    const subjects = (
      isTutor ? person.helpNeeded : person.skills || []
    ).map((s) => s.toLowerCase());

    const matchesSearch =
      !trimmedTerm ||
      person.name?.toLowerCase().includes(trimmedTerm) ||
      person.course?.toLowerCase().includes(trimmedTerm) ||
      subjects.some((s) => s.includes(trimmedTerm));

    if (!filterByMatch) return matchesSearch;

    return matchesSearch && subjects.some((s) => mySubjects.includes(s));
  });

  /* ================= HANDLERS ================= */
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError("Search cannot be empty");
      return;
    }
    setSearchError("");
  };

  /* ================= LOADING & ERROR ================= */
  if (loading) {
    return (
      <Loading
        text={`Loading ${isTutor ? "students" : "tutors"}...`}
      />
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="logo">PeerSeeker</div>

        <div className="nav-right">
          <div className="welcome-text">
            Welcome, <strong>{user?.name || "User"}</strong> ({role})
          </div>

          <button
            className="bookings-btn"
            onClick={() => navigate("/bookmarks")}
          >
            Bookmarks
          </button>

          <button
            className="bookings-btn"
            onClick={() => navigate("/bookings")}
          >
            Bookings
          </button>

          <div
            className="profile-btn"
            onClick={() => navigate("/profile")}
            title="My Profile"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${
                user?.name || "User"
              }&background=2563eb&color=fff`}
              alt="Profile"
            />
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>
          {isTutor
            ? "Empower students, share your knowledge."
            : "Inspire hope, ignite the imagination."}
        </h1>

        <div className="search-box">
          <input
            type="text"
            placeholder={
              isTutor
                ? "Search students by name, course, or need"
                : "Search tutors by name, skill, or course"
            }
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchError("");

              if (value.length > MAX_SEARCH_LENGTH) {
                setSearchError(
                  `Search cannot exceed ${MAX_SEARCH_LENGTH} characters`
                );
                return;
              }

              if (/^[^a-zA-Z0-9\s]+$/.test(value)) {
                setSearchError("Please enter letters or numbers");
                return;
              }

              setSearchTerm(value);
            }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {searchError && <p className="search-error">{searchError}</p>}

        {mySubjects.length > 0 && (
          <button
            onClick={() => setFilterByMatch((prev) => !prev)}
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #2563eb",
              background: filterByMatch ? "#2563eb" : "white",
              color: filterByMatch ? "white" : "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {filterByMatch
              ? "Show All"
              : isTutor
              ? "Show Students I Can Help"
              : "Show Tutors For My Subjects"}
          </button>
        )}
      </section>

      {/* ================= LIST ================= */}
      <section className="recommended">
        <h2>
          {isTutor ? "Available Students" : "Recommended Tutors"}
        </h2>

        <p className="subtitle">
          {isTutor
            ? "Find students who need help in your skills."
            : "Find tutors that match what you need help with."}
        </p>

        <div className="student-grid">
          {filteredPeople.length === 0 ? (
            <p>No results found</p>
          ) : (
            filteredPeople.map((person) => (
              <div
                className="student-card"
                key={person._id}
                onClick={() =>
                  navigate(
                    isTutor
                      ? `/student/${person._id}`
                      : `/tutor/${person._id}`
                  )
                }
              >
                <div className="avatar"></div>

                <p className="student-name">
                  {person.name || "Unnamed"}
                </p>

                <p className="student-course">
                  {person.course || "Unknown Course"} — Year{" "}
                  {person.year || "N/A"}
                </p>

                {(isTutor
                  ? person.helpNeeded
                  : person.skills)?.length > 0 && (
                  <p className="student-skills">
                    {(isTutor
                      ? person.helpNeeded
                      : person.skills
                    ).join(", ")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
