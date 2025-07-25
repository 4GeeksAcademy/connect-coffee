import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {userPointCreate} from "../services/api_userpoints"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const ReviewForm = ({ store_id }) => {
  const { store, dispatch } = useGlobalReducer();
  const [form, setForm] = useState({
    description: "",
    points: 0,
    store_id:store_id
  });

  const [alert, setAlert] = useState({ show: false }); // Simulación si estás usando alertas

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (alert.show) {
      setAlert({ show: false });
    }
  };

  const handleRatingClick = (value) => {
    setForm((prev) => ({
      ...prev,
      points: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    userPointCreate(store.token,form)
    // Acá podrías usar fetch/axios con setToken para enviar
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Comment</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            placeholder="Leave your comment here"
            value={form.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Rating</label>
          <div className="star-rating" style={{ direction: "rtl", display: "inline-block" }}>
            {[5, 4, 3, 2, 1].map((value) => (
              <label
                key={value}
                className={`bi bi-star-fill ${
                  form.points >= value ? "text-warning" : "text-secondary"
                }`}
                onClick={() => handleRatingClick(value)}
                style={{
                  fontSize: "24px",
                  padding: "0 2px",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
              ></label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Submit Comment</button>
      </form>
    </>
  );
};

export default ReviewForm;
