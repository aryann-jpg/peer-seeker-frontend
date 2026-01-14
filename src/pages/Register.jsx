import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router";
import "../css/Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    course: "",
    year: "",
    skills: "",
    helpNeeded: "",
    bio: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        course: form.course,
        year: form.year,
        bio: form.bio,
        skills:
          form.role === "tutor" && form.skills
            ? form.skills.split(",").map((s) => s.trim())
            : [],

        helpNeeded:
          form.role === "student" && form.helpNeeded
            ? form.helpNeeded.split(",").map((h) => h.trim())
            : [],
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">
          Join PeerSeeker and start learning together
        </p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <div className="role-select">
            <label>
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === "student"}
                onChange={handleChange}
              />
              Student (Looking for help)
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="tutor"
                checked={form.role === "tutor"}
                onChange={handleChange}
              />
              Tutor (I want to teach)
            </label>
          </div>

          <input
            name="course"
            placeholder="Course (e.g. Computer Science)"
            onChange={handleChange}
          />

          <input
            name="year"
            placeholder="Year of Study (e.g. 2)"
            onChange={handleChange}
          />
          {form.role === "student" && (
            <input
              name="helpNeeded"
              placeholder="What do you need help with? (comma separated)"
              onChange={handleChange}
            />
          )}

          {form.role === "tutor" && (
            <input
              name="skills"
              placeholder="What can you teach? (comma separated)"
              onChange={handleChange}
            />
          )}

          <textarea
            name="bio"
            placeholder={
              form.role === "student"
                ? "Describe what you’re struggling with"
                : "Short tutor bio"
            }
            onChange={handleChange}
          />

          <button type="submit">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
