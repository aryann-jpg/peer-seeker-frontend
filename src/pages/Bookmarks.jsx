import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router";
import "../css/Bookmarks.css";

const Bookmarks = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const res = await api.get("/bookmarks");
        setTutors(res.data);
      } catch (err) {
        console.error("Failed to fetch bookmarks");
      }
    };

    fetchBookmarks();
  }, [navigate, token]);

const removeBookmark = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this tutor from your bookmarks?"
  );

  if (!confirmed) return;

  await api.post(`/bookmarks/${id}`);
    `/bookmarks/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  

  setTutors((prev) => prev.filter((t) => t._id !== id));
};


  return (
    <div className="bookmark-page">
      <div className="bookmark-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1> Bookmarked Tutors</h1>
      </div>

      {tutors.length === 0 && (
        <p className="empty">No bookmarked tutors yet</p>
      )}

      <div className="bookmark-grid">
        {tutors.map((tutor) => (
          <div key={tutor._id} className="bookmark-card">
            <img
              src={`https://ui-avatars.com/api/?name=${tutor.name}`}
              alt={tutor.name}
            />

            <h3>{tutor.name}</h3>
            <p>{tutor.course}</p>

            <p className="skills">
              {tutor.skills?.join(", ") || "No skills listed"}
            </p>

            <button onClick={() => navigate(`/tutor/${tutor._id}`)}>
              View Profile
            </button>

            <button
              className="remove"
              onClick={() => removeBookmark(tutor._id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
