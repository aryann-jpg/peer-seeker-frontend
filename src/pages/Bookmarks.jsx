import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router";
import Loading from "./Loading";
import "../css/Bookmarks.css";

const Bookmarks = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchBookmarks = async () => {
      try {
        const res = await api.get("/bookmarks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTutors(res.data);
      } catch {
        alert("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [navigate, token]);

  if (loading) return <Loading text="Loading bookmarks..." />;

  const removeBookmark = async (id) => {
    try {
      await api.post(
        `/bookmarks/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTutors((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Failed to remove bookmark");
    }
  };

  return (
    <div className="bookmark-page">
      <button onClick={() => navigate("/")}>← Back</button>

      {tutors.length === 0 && <p>No bookmarked tutors</p>}

      <div className="bookmark-grid">
        {tutors.map((tutor) => (
          <div key={tutor._id} className="bookmark-card">
            <h3>{tutor.name}</h3>
            <p>{tutor.course}</p>
            <button onClick={() => navigate(`/tutor/${tutor._id}`)}>
              View Profile
            </button>
            <button className="remove" onClick={() => removeBookmark(tutor._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
