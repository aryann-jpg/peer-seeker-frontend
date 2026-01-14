import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "../css/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "/profile/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(res.data);
        setForm(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        course: form.course,
        year: form.year,
        bio: form.bio,
        avatar: form.avatar, 
      };

      if (user.role === "student") {
        payload.helpNeeded =
          typeof form.helpNeeded === "string"
            ? form.helpNeeded.split(",").map((h) => h.trim())
            : form.helpNeeded;
      }

      if (user.role === "tutor") {
        payload.skills =
          typeof form.skills === "string"
            ? form.skills.split(",").map((s) => s.trim())
            : form.skills;
      }

      const res = await axios.put(
        "/profile/me",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setForm(res.data);
      setEditing(false);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!user) return <p>Profile not found</p>;

  return (
    <div className="profile-page">
      <header className="profile-navbar">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Logout
        </button>
      </header>

      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={
              (editing ? form.avatar : user.avatar) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=2563eb&color=fff`
            }
            alt="Profile"
          />

          {editing && (
            <label className="avatar-upload">
              Change
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>

        {!editing ? (
          <>
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            <div className="profile-details">
              <table>
                <tbody>
                  <tr>
                    <th>Course</th>
                    <td>{user.course || "Not specified"}</td>
                  </tr>

                  <tr>
                    <th>Year</th>
                    <td>{user.year || "Not specified"}</td>
                  </tr>

                  {user.role === "student" && (
                    <tr>
                      <th>Needs Help In</th>
                      <td>
                        {user.helpNeeded?.length
                          ? user.helpNeeded.join(", ")
                          : "Not specified"}
                      </td>
                    </tr>
                  )}

                  {user.role === "tutor" && (
                    <tr>
                      <th>Skills</th>
                      <td>
                        {user.skills?.length
                          ? user.skills.join(", ")
                          : "Not specified"}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <th>Bio</th>
                    <td>{user.bio || "No bio provided"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Name"
            />

            <input
              name="course"
              value={form.course || ""}
              onChange={handleChange}
              placeholder="Course"
            />

            <input
              name="year"
              value={form.year || ""}
              onChange={handleChange}
              placeholder="Year"
            />

            {user.role === "student" && (
              <input
                name="helpNeeded"
                value={
                  Array.isArray(form.helpNeeded)
                    ? form.helpNeeded.join(", ")
                    : form.helpNeeded || ""
                }
                onChange={handleChange}
                placeholder="What do you need help with?"
              />
            )}

            {user.role === "tutor" && (
              <input
                name="skills"
                value={
                  Array.isArray(form.skills)
                    ? form.skills.join(", ")
                    : form.skills || ""
                }
                onChange={handleChange}
                placeholder="Skills you can teach"
              />
            )}

            <textarea
              name="bio"
              value={form.bio || ""}
              onChange={handleChange}
              placeholder="Bio"
            />

            {error && <p className="profile-error">{error}</p>}

            <div className="profile-actions">
              <button onClick={handleSave}>Save</button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setForm(user);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
