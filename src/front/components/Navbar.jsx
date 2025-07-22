import { Link } from "react-router-dom";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalHelpers } from "../hooks/useGlobalHelpers";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const [showProfile, setShowProfile] = useState(false);
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const { logoutUser } = useGlobalHelpers();
	const handleLogout = () => {
		logoutUser();
		navigate('/login')
	}

	return (
		<>

			{(location.pathname !== '/Hero') && (
				<nav
					className="navbar navbar-expand-lg"
					style={{
						backgroundColor: '#fce8d9',
						borderBottom: '1px solid #e8d5c4'
					}}
				>
					<div className="container">
						{/* Logo y Título */}
						<Link to="/" className="navbar-brand d-flex align-items-center">
							<i className="fas fa-coffee me-2" style={{ fontSize: '1.4rem', color: '#8b4513' }}></i>
							<span
								className="fw-bold"
								style={{
									color: '#8b4513',
									fontSize: '1.3rem'
								}}
							>
								Coffee Connect <routes className="users"></routes>
							</span>
						</Link>

						{/* Botón hamburguesa para móvil */}
						<button
							className="navbar-toggler border-0"
							type="button"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-expanded={isMenuOpen}
							style={{
								color: '#8b4513',
								boxShadow: 'none'
							}}
						>
							<i className="fas fa-bars"></i>
						</button>

						{/* Menú de navegación */}
						<div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
							<ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
								<li className="nav-item">
									<Link
										to="/"
										className="nav-link px-3 py-2 rounded"
										style={{
											color: '#6b4423',
											fontWeight: '500',
											transition: 'all 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.target.style.backgroundColor = '#e8d5c4';
											e.target.style.color = '#8b4513';
										}}
										onMouseLeave={(e) => {
											e.target.style.backgroundColor = 'transparent';
											e.target.style.color = '#6b4423';
										}}
									>
										<i className="fas fa-home me-1"></i>
										Inicio
									</Link>
								</li>
								{(location.pathname !== '/') && (
									<li className="nav-item">
										<Link
											to="/CafeDetails"
											className="nav-link px-3 py-2 rounded"
											style={{
												color: '#6b4423',
												fontWeight: '500',
												transition: 'all 0.2s ease'
											}}
											onMouseEnter={(e) => {
												e.target.style.backgroundColor = '#e8d5c4';
												e.target.style.color = '#8b4513';
											}}
											onMouseLeave={(e) => {
												e.target.style.backgroundColor = 'transparent';
												e.target.style.color = '#6b4423';
											}}
										>
											<i className="fas fa-store me-1"></i>
											{/* Implementar campo de visibilidad false para cuando esta logged como Consumer / Provider / SuperAdmin ** */}
											Cafeterías
										</Link>
									</li>
								)}
								<li className="nav-item">
									<Link
										to="/about"
										className="nav-link px-3 py-2 rounded"
										style={{
											color: '#6b4423',
											fontWeight: '500',
											transition: 'all 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.target.style.backgroundColor = '#e8d5c4';
											e.target.style.color = '#8b4513';
										}}
										onMouseLeave={(e) => {
											e.target.style.backgroundColor = 'transparent';
											e.target.style.color = '#6b4423';
										}}
									>
										<i className="fas fa-info-circle me-1"></i>
										Acerca de
									</Link>
								</li>
							</ul>

							{/* Botones de acción */}
							<div className="d-flex align-items-center gap-2">
								{/* Botones cuando no hay una sesion iniciada */}
								{!store?.token ? (
									<>
										{/* Separador vertical */}
										<div className="vr mx-2" style={{ height: '30px', opacity: 0.3 }}></div>


										{/* Sección para User Consumer */}
										<div className="d-flex align-items-center">
											<span className="text-muted small me-2">Usuarios:</span>
											{(location.pathname !== '/login') && (
												<Link to="/login">
													<button
														className="btn btn-sm me-2 px-3 py-2"
														style={{
															backgroundColor: 'transparent',
															color: '#8b4513',
															border: '1px solid #d4a574',
															borderRadius: '6px',
															fontWeight: '500',
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															e.target.style.backgroundColor = '#d4a574';
															e.target.style.color = '#6b4423';
														}}
														onMouseLeave={(e) => {
															e.target.style.backgroundColor = 'transparent';
															e.target.style.color = '#8b4513';
														}}
													>
														<i className="fas fa-sign-in-alt me-1"></i>
														Iniciar Sesión
													</button>
												</Link>
											)}
											{(location.pathname !== '/signup') && (
												<Link to="/signup">
													<button
														className="btn btn-sm me-2 px-3 py-2"
														style={{
															backgroundColor: '#d4a574',
															color: '#6b4423',
															border: 'none',
															borderRadius: '6px',
															fontWeight: '500',
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															e.target.style.backgroundColor = '#c19660';
														}}
														onMouseLeave={(e) => {
															e.target.style.backgroundColor = '#d4a574';
														}}
													>
														<i className="fas fa-user-plus me-1"></i>
														Registrarse
													</button>
												</Link>
											)}
										</div>

										{/* Separador vertical */}
										<div className="vr mx-2" style={{ height: '30px', opacity: 0.3 }}></div>

										{/* Sección para User Provider */}
										<div className="dropdown">
											<button
												className="btn btn-sm dropdown-toggle px-3 py-2"
												type="button"
												data-bs-toggle="dropdown"
												style={{
													backgroundColor: '#8b4513',
													color: '#fff',
													border: 'none',
													borderRadius: '6px',
													fontWeight: '500',
													transition: 'all 0.2s ease'
												}}
												onMouseEnter={(e) => {
													e.target.style.backgroundColor = '#6b4423';
												}}
												onMouseLeave={(e) => {
													e.target.style.backgroundColor = '#8b4513';
												}}
											>
												<i className="fas fa-store me-1"></i>
												Para Cafeterías
											</button>
											<ul
												className="dropdown-menu border-0 shadow-sm"
												style={{
													backgroundColor: '#f9f4ee',
													borderRadius: '8px',
													padding: '8px',
													minWidth: '220px',
													marginTop: '4px'
												}}
											>
												<li className="px-3 py-2">
													<h6 className="mb-1" style={{ color: '#8b4513' }}>
														<i className="fas fa-store me-2"></i>
														Portal para Cafeterías
													</h6>
													<small className="text-muted">
														Administra tu negocio con nosotros
													</small>
												</li>
												<li><hr className="dropdown-divider" style={{ borderColor: '#e8d5c4' }} /></li>
												<li>
													<Link
														to="/login?type=Store"
														className="dropdown-item rounded d-flex align-items-center"
														style={{
															color: '#6b4423',
															padding: '10px 14px',
															marginBottom: '2px',
															transition: 'all 0.2s ease',
															fontWeight: '500'
														}}
														onMouseEnter={(e) => {
															e.target.style.backgroundColor = '#e8d5c4';
														}}
														onMouseLeave={(e) => {
															e.target.style.backgroundColor = 'transparent';
														}}
													>
														<i className="fas fa-sign-in-alt me-3" style={{ color: '#8b4513', width: '16px' }}></i>
														<span>Iniciar Sesión</span>
													</Link>
												</li>
												<li>
													<Link
														to="/signup?type=Store"
														className="dropdown-item rounded d-flex align-items-center"
														style={{
															color: '#6b4423',
															padding: '10px 14px',
															transition: 'all 0.2s ease',
															fontWeight: '500'
														}}
														onMouseEnter={(e) => {
															e.target.style.backgroundColor = '#e8d5c4';
														}}
														onMouseLeave={(e) => {
															e.target.style.backgroundColor = 'transparent';
														}}
													>
														<i className="fas fa-user-plus me-3" style={{ color: '#8b4513', width: '16px' }}></i>
														<span>Registrar mi Cafetería</span>
													</Link>
												</li>
											</ul>
										</div>
									</>
								) : (
									<>
										{/* Cuando hay sesión iniciada */}
										<div className="dropdown ">
											<button
												className="fw-bold custom-fg-brown d-flex align-items-center text-decoration-none"
												onClick={() => setShowProfile(!showProfile)}
											>
												<i className="fa-solid fa-user fs-4 me-2 custom-fg-brown"></i>
												<span className="fw-bold custom-fg-brown ">¡Hola {store.user}!</span>
											</button>

											{showProfile && (

												<div className="dropdown-menu dropdown-menu-end show">
													<div className="dropdown-header">
														<strong>{store.user}</strong><br />
														<small>{store.role}</small><br />
													</div>
													<div className="dropdown-divider"></div>
													<Link to="/UserDetails" className="text-decoration-none link-warning mx-3">👤 Mi Perfil</Link>
													<div className="dropdown-divider"></div>
													<button className="dropdown-item text-danger" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</button>
												</div>
											)}
										</div>

									</>
								)}
								{/* Botón Views - Solo para SuperAdmin */}
								{(store?.role === 'Superadmin') && (
									<div className="dropdown">
										<button
											className="btn btn-sm dropdown-toggle px-3 py-2"
											type="button"
											data-bs-toggle="dropdown"
											style={{
												backgroundColor: '#c19660',
												color: '#6b4423',
												border: 'none',
												borderRadius: '6px',
												fontWeight: '500',
												transition: 'all 0.2s ease'
											}}
											onMouseEnter={(e) => {
												e.target.style.backgroundColor = '#b08751';
											}}
											onMouseLeave={(e) => {
												e.target.style.backgroundColor = '#c19660';
											}}
										>
											<i className="fas fa-business-time me-1"></i>
											Views
										</button>
										<ul
											className="dropdown-menu border-0 shadow-sm"
											style={{
												backgroundColor: '#f9f4ee',
												borderRadius: '8px',
												padding: '8px',
												minWidth: '200px',
												marginTop: '4px'
											}}
										>
											<li>
												<Link
													to="/CafeDetails"
													className="dropdown-item rounded d-flex align-items-center"
													style={{
														color: '#6b4423',
														padding: '10px 14px',
														marginBottom: '2px',
														transition: 'all 0.2s ease',
														fontWeight: '500'
													}}
													onMouseEnter={(e) => {
														e.target.style.backgroundColor = '#e8d5c4';
													}}
													onMouseLeave={(e) => {
														e.target.style.backgroundColor = 'transparent';
													}}
												>
													<i className="fas fa-store me-3" style={{ color: '#8b4513', width: '16px' }}></i>
													<span>Cafe Details</span>
												</Link>
											</li>
											{/* Botón vista perfil de usuario */}
											<li>
												<Link
													to="/UserDetails"
													className="dropdown-item rounded d-flex align-items-center"
													style={{
														color: '#6b4423',
														padding: '10px 14px',
														marginBottom: '2px',
														transition: 'all 0.2s ease',
														fontWeight: '500'
													}}
													onMouseEnter={(e) => {
														e.target.style.backgroundColor = '#e8d5c4';
													}}
													onMouseLeave={(e) => {
														e.target.style.backgroundColor = 'transparent';
													}}
												>
													<i className="fas fa-store me-3" style={{ color: '#8b4513', width: '16px' }}></i>
													<span>User Details</span>
												</Link>
											</li>
											<li>
												<Link
													to="/provider"
													className="dropdown-item rounded d-flex align-items-center"
													style={{
														color: '#6b4423',
														padding: '10px 14px',
														marginBottom: '2px',
														transition: 'all 0.2s ease',
														fontWeight: '500'
													}}
													onMouseEnter={(e) => {
														e.target.style.backgroundColor = '#e8d5c4';
													}}
													onMouseLeave={(e) => {
														e.target.style.backgroundColor = 'transparent';
													}}
												>
													<i className="fas fa-sign-in-alt me-3" style={{ color: '#8b4513', width: '16px' }}></i>
													<span>View Provider</span>
												</Link>
											</li>
											<li>
												<hr
													className="dropdown-divider"
													style={{
														borderColor: '#e8d5c4',
														margin: '6px 0',
														opacity: '0.7'
													}}
												/>
											</li>
											<li>
												<Link
													to="/AdminDetails"
													className="dropdown-item rounded d-flex align-items-center"
													style={{
														color: '#6b4423',
														padding: '10px 14px',
														transition: 'all 0.2s ease',
														fontWeight: '500'
													}}
													onMouseEnter={(e) => {
														e.target.style.backgroundColor = '#e8d5c4';
													}}
													onMouseLeave={(e) => {
														e.target.style.backgroundColor = 'transparent';
													}}
												>
													<i className="fas fa-cog me-3" style={{ color: '#8b4513', width: '16px' }}></i>
													<span>Panel Admin</span>
												</Link>
											</li>
										</ul>
									</div>
								)}
							</div>
						</div>
					</div>
				</nav>

			)}
		</>
	);
};