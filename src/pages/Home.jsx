import { useEffect, useState } from "react";
import api from "../api";
import "../css/Home.css";
import { useNavigate } from "react-router";

const MAX_SEARCH_LENGTH = 30;

const Home = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [filterByHelpNeeded, setFilterByHelpNeeded] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const helpNeeded = (user?.helpNeeded || []).map((h) =>
    h.toLowerCase()
  );

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  /* ================= FETCH TUTORS ================= */
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await api.get("/tutors");

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format from server");
        }

        setTutors(res.data);
      } catch (err) {
        console.error("API ERROR:", err);
        setError(
          err.response?.data?.message ||
            "Unable to fetch tutors. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const trimmedTerm = searchTerm.trim().toLowerCase();

  const filteredTutors = tutors.filter((tutor) => {
    const skills = (tutor.skills || []).map((s) => s.toLowerCase());

    const matchesSearch =
      !trimmedTerm ||
      tutor.name?.toLowerCase().includes(trimmedTerm) ||
      tutor.course?.toLowerCase().includes(trimmedTerm) ||
      skills.some((skill) => skill.includes(trimmedTerm));

    if (!filterByHelpNeeded) return matchesSearch;

    return (
      matchesSearch &&
      skills.some((skill) => helpNeeded.includes(skill))
    );
  });

  /* ================= HANDLERS ================= */
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError("Search cannot be empty");
      return;
    }
    setSearchError("");
  };

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading tutors...</h2>;
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
            Welcome, <strong>{user?.name || "User"}</strong>
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
          Inspire hope, ignite <br /> the imagination.
        </h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search tutors by name, skill, or course"
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

        {/* ===== FILTER BUTTON (WILL SHOW) ===== */}
        {helpNeeded.length > 0 && (
          <button
            onClick={() => setFilterByHelpNeeded((prev) => !prev)}
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #2563eb",
              background: filterByHelpNeeded ? "#2563eb" : "white",
              color: filterByHelpNeeded ? "white" : "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {filterByHelpNeeded
              ? "Show All Tutors"
              : "Show Tutors For My Subjects"}
          </button>
        )}
      </section>

      {/* ================= TUTORS ================= */}
      <section className="recommended">
        <h2>Recommended Tutors</h2>
        <p className="subtitle">
          Connect with our student tutors who can help you learn faster!
        </p>

        <div className="student-grid">
          {filteredTutors.length === 0 ? (
            <p>No tutors match your criteria</p>
          ) : (
            filteredTutors.map((tutor) => (
              <div
                className="student-card"
                key={tutor._id}
                onClick={() => navigate(`/tutor/${tutor._id}`)}
              >
                <div className="avatar"></div>

                <p className="student-name">
                  {tutor.name || "Unnamed Tutor"}
                </p>

                <p className="student-course">
                  {tutor.course || "Unknown Course"} — Year{" "}
                  {tutor.year || "N/A"}
                </p>

                {tutor.skills?.length > 0 && (
                  <p className="student-skills">
                    {tutor.skills.join(", ")}
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
