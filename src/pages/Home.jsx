import { useEffect, useState } from "react-router";
import api from "../api";
import "../css/Home.css";
import { useNavigate } from "react-router";

const MAX_SEARCH_LENGTH = 30;

const Home = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [filterByMatching, setFilterByMatching] = useState(false);

  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "student"; // Default to student if not found
  const isTutor = userRole === "tutor";

  // Match logic: Tutors match with student needs, Students match with tutor skills
  const myInterests = isTutor ? user?.skills || [] : user?.helpNeeded || [];

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  /* ================= FETCH DATA (CONDITIONAL) ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Switch endpoint based on who is logged in
        const endpoint = isTutor ? "/students" : "/tutors";
        const res = await api.get(endpoint);

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format from server");
        }

        setPeople(res.data);
      } catch (err) {
        console.error("API ERROR:", err);
        setError(err.response?.data?.message || "Unable to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isTutor]);

  /* ================= FILTER LOGIC ================= */
  const trimmedTerm = searchTerm.trim().toLowerCase();

  const filteredList = people.filter((person) => {
    const nameMatch = person.name?.toLowerCase().includes(trimmedTerm);
    const courseMatch = person.course?.toLowerCase().includes(trimmedTerm);
    
    // Check skills (for tutors) or needsHelpIn (for students)
    const subjects = isTutor ? person.needsHelpIn : person.skills;
    const subjectMatch = subjects?.some((s) => s.toLowerCase().includes(trimmedTerm));

    const matchesSearch = !trimmedTerm || nameMatch || courseMatch || subjectMatch;

    if (!filterByMatching) return matchesSearch;

    // Filter by users who share my subjects
    return matchesSearch && subjects?.some((s) => myInterests.includes(s));
  });

  /* ================= HANDLERS ================= */
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError("Search cannot be empty");
      return;
    }
    setSearchError("");
  };

  if (loading) return <h2 style={{ padding: "40px" }}>Loading users...</h2>;

  if (error) return (
    <div className="error-screen">
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="home">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="logo">PeerSeeker</div>
        <div className="nav-right">
          <div className="welcome-text">
            Welcome, <strong>{user?.name || "User"}</strong> ({userRole})
          </div>
          <button className="bookings-btn" onClick={() => navigate("/bookings")}>Bookings</button>
          <div className="profile-btn" onClick={() => navigate("/profile")}>
            <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=2563eb&color=fff`} alt="Profile" />
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1>
          {isTutor 
            ? "Empower students, \n share your knowledge." 
            : "Inspire hope, ignite \n the imagination."}
        </h1>

        <div className="search-box">
          <input
            type="text"
            placeholder={isTutor ? "Search students by name or need..." : "Search tutors by name or skill..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {myInterests.length > 0 && (
          <button
            onClick={() => setFilterByMatching((prev) => !prev)}
            className="filter-toggle-btn"
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #2563eb",
              background: filterByMatching ? "#2563eb" : "white",
              color: filterByMatching ? "white" : "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {filterByMatching ? "Show All" : isTutor ? "Show Students I Can Help" : "Show Tutors For My Needs"}
          </button>
        )}
      </section>

      {/* ================= USER GRID ================= */}
      <section className="recommended">
        <h2>{isTutor ? "Available Students" : "Recommended Tutors"}</h2>
        <p className="subtitle">
          {isTutor 
            ? "Connect with students who need help in subjects you master!" 
            : "Connect with our student tutors who can help you learn faster!"}
        </p>

        <div className="student-grid">
          {filteredList.length === 0 ? (
            <p>No results found</p>
          ) : (
            filteredList.map((person) => (
              <div
                className="student-card"
                key={person._id}
                onClick={() => navigate(isTutor ? `/student/${person._id}` : `/tutor/${person._id}`)}
              >
                <div className="avatar">{person.name?.charAt(0)}</div>
                <p className="student-name">{person.name}</p>
                <p className="student-course">
                  {person.course} — Year {person.year}
                </p>
                <p className="student-skills">
                  {isTutor 
                    ? `Needs help in: ${person.needsHelpIn?.join(", ")}` 
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