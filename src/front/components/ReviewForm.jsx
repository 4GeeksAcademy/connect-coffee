import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { userPointCreate } from "../services/api_userpoints";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import AlertMessage from '../components/AlertMessage.jsx';

// ✅ Agregar onReviewSubmitted como prop
export const ReviewForm = ({ store_id, onReviewSubmitted }) => {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    description: "",
    points: 0,
    store_id: store_id
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'danger'
  });

  const showAlert = (message, type = 'danger') => {
    setAlert({
      show: true,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlert({
      show: false,
      message: '',
      type: 'danger'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (alert.show) {
      hideAlert();
    }
  };

  const handleRatingClick = (value) => {
    setForm((prev) => ({
      ...prev,
      points: value,
    }));

    // ✅ Ocultar alerta cuando selecciona estrellas
    if (alert.show) {
      hideAlert();
    }
  };

  // ✅ Hacer handleSubmit async y corregir la estructura
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validaciones
    if (form.points === 0) {
      showAlert('Por favor, selecciona una calificación con estrellas', 'warning');
      return;
    }

    if (!form.description.trim()) {
      showAlert('Por favor, escribe un comentario sobre tu experiencia', 'warning');
      return;
    }

    if (form.description.trim().length < 10) {
      showAlert('El comentario debe tener al menos 10 caracteres', 'warning');
      return;
    }

    if (!store.token) {
      showAlert('Debes iniciar sesión para enviar una reseña', 'danger');
      return;
    }

    try {
      setLoading(true);
      hideAlert();
      console.log("Enviando reseña:", form);

      const response = await userPointCreate(store.token, form);
      console.log("Respuesta del servidor:", response);

      if (response && response.ok) {
        showAlert('¡Reseña enviada exitosamente! Gracias por tu opinión.', 'success');

        // ✅ Limpiar el formulario después del éxito
        setForm({
          description: "",
          points: 0,
          store_id: store_id
        });

        // ✅ Llamar al callback si existe
        if (onReviewSubmitted) {
          onReviewSubmitted(response);
        }
      } else {
        const errorMessage = response?.msg || response?.message || 'Error al enviar la reseña';
        showAlert(errorMessage, 'danger');
      }

    } catch (error) {
      console.error('Error enviando reseña:', error);
      showAlert('Error de conexión. Por favor, intenta nuevamente.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mover el return fuera de la función handleSubmit
  return (
    <>
      {/* Componente de Alerta */}
      <AlertMessage
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onClose={hideAlert}
        autoClose={5000}
      />

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Comentarios <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            placeholder="Cuéntanos sobre tu experiencia en esta cafetería..."
            value={form.description}
            onChange={handleInputChange}
            disabled={loading}
            maxLength="500"
          ></textarea>
          <div className="form-text">
            {form.description.length}/255 caracteres
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">
            ¿Cómo calificarías este lugar? <span className="text-danger">*</span>
          </label>
          <div className="d-flex align-items-center gap-3">
            <div className="star-rating" style={{ direction: "rtl", display: "inline-block" }}>
              {[5, 4, 3, 2, 1].map((value) => (
                <label
                  key={value}
                  className={`bi bi-star-fill ${form.points >= value ? "text-warning" : "text-secondary"
                    }`}
                  onClick={() => !loading && handleRatingClick(value)}
                  style={{
                    fontSize: "28px",
                    padding: "0 4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "transform 0.2s ease",
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                ></label>
              ))}
            </div>
            {form.points > 0 && (
              <span className="badge bg-warning text-dark">
                {form.points} {form.points === 1 ? 'estrella' : 'estrellas'}
              </span>
            )}
          </div>
          <div className="form-text">
            Selecciona de 1 a 5 estrellas según tu experiencia
          </div>
        </div>

        {/* Botón mejorado con loading */}
        <div className="d-grid">
          <button
            type="submit"
            className="btn btn-dos d-flex align-items-center justify-content-center"
            disabled={loading}
            style={{
              minHeight: '45px',
              backgroundColor: loading ? '#6c757d' : undefined,
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Enviando...</span>
                </span>
                Enviando reseña...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Enviar reseña
              </>
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Tu reseña será pública y ayudará a otros usuarios a conocer mejor esta cafetería.
          </small>
        </div>
      </form>
    </>
  );
};

export default ReviewForm;