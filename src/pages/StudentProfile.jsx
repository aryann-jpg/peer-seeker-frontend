import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../api";
import Loading from "./Loading";
import "../css/TutorProfile.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    api
      .get(`/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudent(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleBookmark = async () => {
    if (!token) return navigate("/login");

    try {
      await api.post(`/bookmarks/${student._id}`);
      setBookmarked((prev) => !prev);
    } catch {
      alert("Failed to bookmark student");
    }
  };

  if (loading) return <Loading text="Loading student profile..." />;
  if (!student) return <p style={{ padding: 40 }}>Student not found</p>;

  return (
    <div className="profile">
      <div className="profile-wrapper">
        <div className="profile-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <button className="bookmark-btn" onClick={handleBookmark}>
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>
        </div>

        <div className="profile-card">
          <img
            className="profile-avatar"
            src={`https://ui-avatars.com/api/?name=${student.name}&background=2563eb&color=fff`}
            alt={student.name}
          />

          <h1>{student.name}</h1>
          <p className="profile-course">
            {student.course} — Year {student.year}
          </p>

          {student.helpNeeded?.length > 0 && (
            <div className="profile-skills">
              <h3>Needs Help With</h3>
              <ul>
                {student.helpNeeded.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {student.bio && (
            <div className="profile-bio">
              <h3>About</h3>
              <p>{student.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
