import { useEffect, useState } from "react";
import api from "../api";

const EditProfile = () => {
  const [form, setForm] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get("/profile/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setForm(res.data))
    .catch(() => alert("Unauthorized"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.put(
      "/profile/me",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Profile updated");
  };

  if (!form) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="course"
        value={form.course || ""}
        onChange={handleChange}
      />

      <input
        name="year"
        value={form.year || ""}
        onChange={handleChange}
      />

      <input
        name="skills"
        value={form.skills?.join(", ") || ""}
        onChange={(e) =>
          setForm({
            ...form,
            skills: e.target.value.split(","),
          })
        }
      />

      <textarea
        name="bio"
        value={form.bio || ""}
        onChange={handleChange}
      />

      <button type="submit">Save</button>
    </form>
  );
};

export default EditProfile;
