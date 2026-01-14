import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Home.css";
import { useNavigate } from "react-router";

const MAX_SEARCH_LENGTH = 30;

const Home = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axios.get("/tutors");

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format from server");
        }

        setTutors(res.data);
      } catch (err) {
        console.error("API ERROR:", err);

        if (err.response) {
          setError(
            err.response.data?.message ||
              "Server error occurred. Please try again later."
          );
        } else if (err.request) {
          setError("Unable to connect to server. Is the backend running?");
        } else {
          setError("Something went wrong. Please refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const trimmedTerm = searchTerm.trim().toLowerCase();

  const filteredTutors = tutors.filter((tutor) => {
    if (!trimmedTerm) return true;

    return (
      tutor.name?.toLowerCase().includes(trimmedTerm) ||
      tutor.course?.toLowerCase().includes(trimmedTerm) ||
      tutor.skills?.some((skill) =>
        skill.toLowerCase().includes(trimmedTerm)
      )
    );
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError("Search cannot be empty");
      return;
    }
    setSearchError("");
  };


  const user = JSON.parse(localStorage.getItem("user"));

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
      <header className="navbar">
        <div className="logo">PeerSeeker</div>

        <div className="nav-right">
          <div className="welcome-text">
            Welcome, <strong>{user?.name || "User"}</strong>
          </div>

          <button
            className="bookmark-btn"
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
            onClick={(e) => {
              e.stopPropagation();
              navigate("/profile");
            }}
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
      </section>

      <section className="recommended">
        <h2>Recommended Tutors</h2>
        <p className="subtitle">
          Connect with OUR student tutors who can help you learn faster!
        </p>

        <div className="student-grid">
          {filteredTutors.length === 0 ? (
            <p>No tutors match your search</p>
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

                {tutor.skills && tutor.skills.length > 0 && (
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
