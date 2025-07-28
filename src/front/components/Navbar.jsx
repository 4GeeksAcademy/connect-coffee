import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalHelpers } from "../hooks/useGlobalHelpers";
import { useGlobalButtons } from "../hooks/useGlobalButtons.jsx";
import { getUserStore } from "../services/api_store";
import "../styles/navbar.css";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const [showProfile, setShowProfile] = useState(false);
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [storeId, setStoreId] = useState(null);
	const [loadingStoreId, setLoadingStoreId] = useState(false);
	const navigate = useNavigate();
	const { logoutUser } = useGlobalHelpers();
	const { BotonDonar, BotonSuscribir } = useGlobalButtons();

	const handleLogout = () => {
		logoutUser();
		navigate('/login')
	}
	const getStoreIdForUser = async () => {
		if (store?.role === 'Store' && store?.token && !storeId && !loadingStoreId) {
			setLoadingStoreId(true);
			try {
				console.log('Obteniendo ID de tienda para navbar...');
				const storeData = await getUserStore(store.token);

				if (storeData.ok && storeData.data && storeData.data.length > 0) {
					const userStoreId = storeData.data[0].id;
					setStoreId(userStoreId);
					console.log('Store ID obtenido para navbar:', userStoreId);
				} else {
					console.warn('Usuario Store sin tienda registrada');
					setStoreId(null);
				}
			} catch (error) {
				console.error('Error obteniendo Store ID para navbar:', error);
				setStoreId(null);
			} finally {
				setLoadingStoreId(false);
			}
		}
	};
	useEffect(() => {
		getStoreIdForUser();
		console.log("---STORE DESDE NAVBAR --- ",store)
	}, [store?.role, store?.token]);
	useEffect(() => {
		if (!store?.token) {
			setStoreId(null);
		}
		console.log("---STORE DESDE NAVBAR 3do UseEFFEct --- ",store)
	}, [store?.token]);

	if (location.pathname !== '/hero') {
		if (store?.role === 'Store') {
			return (
				<nav
					className="navbar navbar-expand-lg"
					style={{
						backgroundColor: '#fce8d9',
						borderBottom: '1px solid #e8d5c4'
					}}
				>
					<div className="container">
						{/* Logo y título del proveedor */}
						<div className="d-flex align-items-center">
							<Link to="/" className="d-flex align-items-center text-decoration-none">
								<i className="fas fa-coffee me-2" style={{ fontSize: '1.4rem', color: '#8b4513' }}></i>
								<div>
									<h5 className="mb-0 fw-bold" style={{ color: '#8b4513' }}>Coffee Connect</h5>
									<small className="text-muted">Panel Proveedor</small>
								</div>
							</Link>
						</div>

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

						{/* Menú de navegación para proveedores */}
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
								<li className="nav-item">
									{/* tab cafe */}
									{storeId ? (
										<Link
											to={`/provider/${storeId}`}
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
											<i className="fas fa-tachometer-alt me-1"></i>
											Mi Dashboard
										</Link>
									) : (
										<span
											className="nav-link px-3 py-2 rounded text-muted"
											style={{ cursor: 'not-allowed' }}
										>
											<i className="fas fa-tachometer-alt me-1"></i>
											{loadingStoreId ? 'Cargando...' : 'Mi Dashboard'}
										</span>
									)}
								</li>
								<li className="nav-item">
									{/* tab menu */}
									{storeId ? (
										<Link
											to={`/provider/${storeId}?tab=menu`}
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
											<i className="fas fa-utensils me-1"></i>
											Mi Menú
										</Link>
									) : (
										<span
											className="nav-link px-3 py-2 rounded text-muted"
											style={{ cursor: 'not-allowed' }}
										>
											<i className="fas fa-utensils me-1"></i>
											{loadingStoreId ? 'Cargando...' : 'Mi Menú'}
										</span>
									)}
								</li>
							</ul>

							{/* Sección de usuario proveedor */}
							<div className="d-flex align-items-center">
								{/* Badge de estado de la tienda */}
								<span className={`badge me-3 ${storeId ? 'bg-success' : 'bg-warning'}`}>
									{storeId ? 'Tienda Activa' : (loadingStoreId ? 'Verificando...' : 'Sin Tienda')}
								</span>

								{/* Dropdown del perfil */}
								<div className="dropdown">
									<button
										className="btn btn-light dropdown-toggle d-flex align-items-center border-0"
										onClick={() => setShowProfile(!showProfile)}
										style={{
											backgroundColor: '#fce8d9',
											color: '#8b4513',
											fontWeight: '500'
										}}
									>
										<i className="fas fa-user-circle me-2" style={{ fontSize: '1.2rem' }}></i>
										{store.user}
									</button>

									{showProfile && (
										<div className="dropdown-menu dropdown-menu-end show shadow-sm border-0"
											style={{
												backgroundColor: '#f9f4ee',
												borderRadius: '8px',
												padding: '8px',
												minWidth: '200px',
												marginTop: '4px'
											}}
										>
											<div className="dropdown-header" style={{ color: '#8b4513' }}>
												<strong>{store.user}</strong><br />
												<small className="text-muted">Proveedor de Cafetería</small>
												{storeId && <small className="text-muted d-block">ID: {storeId}</small>}
											</div>
											<div className="dropdown-divider" style={{ borderColor: '#e8d5c4' }}></div>

											<button
												className="dropdown-item rounded d-flex align-items-center text-danger"
												onClick={handleLogout}
												style={{
													padding: '10px 14px',
													transition: 'all 0.2s ease',
													fontWeight: '500',
													border: 'none',
													backgroundColor: 'transparent',
													width: '100%',
													textAlign: 'left'
												}}
												onMouseEnter={(e) => {
													e.target.style.backgroundColor = '#f8d7da';
												}}
												onMouseLeave={(e) => {
													e.target.style.backgroundColor = 'transparent';
												}}
											>
												<i className="fas fa-sign-out-alt me-3" style={{ width: '16px' }}></i>
												Cerrar Sesión
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</nav>
			);
		}
		return (
			<>
				{(location.pathname !== '/hero') && (
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
									Coffee Connect
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
											{/* Cuando hay sesión iniciada (usuario consumer) */}
											<div className="dropdown">
												<button
													className="btn dropdown-toggle d-flex align-items-center border-0 px-3 py-2"
													onClick={() => setShowProfile(!showProfile)}
													style={{
														backgroundColor: '#fce8d9',
														color: '#8b4513',
														borderRadius: '8px',
														fontWeight: '600',
														fontSize: '0.95rem',
														transition: 'all 0.2s ease',
														boxShadow: '0 2px 4px rgba(139, 69, 19, 0.1)'
													}}
													onMouseEnter={(e) => {
														e.target.style.backgroundColor = '#f4d1ae';
														e.target.style.transform = 'translateY(-1px)';
														e.target.style.boxShadow = '0 4px 8px rgba(139, 69, 19, 0.15)';
													}}
													onMouseLeave={(e) => {
														e.target.style.backgroundColor = '#fce8d9';
														e.target.style.transform = 'translateY(0)';
														e.target.style.boxShadow = '0 2px 4px rgba(139, 69, 19, 0.1)';
													}}
												>
													<div className="d-flex align-items-center">
														<div className="rounded-circle d-flex align-items-center justify-content-center me-2"
															style={{
																width: '32px',
																height: '32px',
																backgroundColor: '#e8d5c4',
																border: '2px solid #d4a574'
															}}>
															<i className="fas fa-user" style={{ fontSize: '0.9rem', color: '#8b4513' }}></i>
														</div>
														<div className="d-flex flex-column align-items-start">
															<span style={{ fontSize: '0.85rem', lineHeight: '1.1', opacity: 0.8 }}>
																¡Hola!
															</span>
															<span style={{ fontSize: '0.95rem', lineHeight: '1.1', fontWeight: '700' }}>
																{store.user}
															</span>
														</div>
													</div>
												</button>

												{showProfile && (
													<div
														className="dropdown-menu dropdown-menu-end show shadow border-0"
														style={{
															backgroundColor: '#f9f4ee',
															borderRadius: '8px',
															padding: '8px',
															minWidth: '200px',
															marginTop: '4px'
														}}
													>
														<div className="dropdown-header" style={{ color: '#8b4513' }}>
															<strong>{store.user}</strong><br />
															<small className="text-muted">{store.role}</small><br />
														</div>
														<div className="dropdown-divider" style={{ borderColor: '#e8d5c4' }}></div>

														{/* Redireccion a perfil / dependiendo de rol */}
														<Link
															to={store?.role === 'Superadmin' ? '/AdminDetails' : '/UserDetails'}
															className="dropdown-item rounded d-flex align-items-center text-decoration-none"
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
															<i className={`fas ${store?.role === 'Superadmin' ? 'fa-crown' : 'fa-user'} me-3`}
																style={{ color: '#8b4513', width: '16px' }}></i>
															{store?.role === 'Superadmin' ? 'Panel Admin' : 'Mi Perfil'}
														</Link>

														<div className="dropdown-divider" style={{ borderColor: '#e8d5c4' }}></div>

														<button
															className="dropdown-item rounded d-flex align-items-center text-danger"
															onClick={handleLogout}
															style={{
																padding: '10px 14px',
																transition: 'all 0.2s ease',
																fontWeight: '500',
																border: 'none',
																backgroundColor: 'transparent',
																width: '100%',
																textAlign: 'left'
															}}
															onMouseEnter={(e) => {
																e.target.style.backgroundColor = '#f8d7da';
															}}
															onMouseLeave={(e) => {
																e.target.style.backgroundColor = 'transparent';
															}}
														>
															<i className="fas fa-sign-out-alt me-3" style={{ width: '16px' }}></i>
															Cerrar Sesión
														</button>
													</div>
												)}
											</div>
										</>
									)}
								</div>
							</div>
							{(store?.role !== 'Store') && (<div className="d-flex align-items-center"> {BotonSuscribir()}</div>)}
						</div>
					</nav>
				)}
			</>
		);
	}
};