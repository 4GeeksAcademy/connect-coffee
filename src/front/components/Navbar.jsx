import { Link } from "react-router-dom";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useLocation } from 'react-router-dom';


export const Navbar = () => {
	const {store, dispatch} =useGlobalReducer();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("token");
		localStorage.removeItem("message");
		dispatch({type:"get_token", payload:"" });
		dispatch({type:"get_hello", payload:"" });
		dispatch({type:"get_user", payload:"" });
		navigate('/login')
		}

	return (
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
								to="/cafeterias"
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
								Cafeterías
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
						{/* Buscador */}
						<div className="input-group me-3" style={{ width: '260px' }}>
							<input
								type="text"
								className="form-control border-0"
								placeholder="Buscar cafeterías..."
								style={{
									backgroundColor: '#f5e6d3',
									color: '#6b4423',
									fontSize: '0.9rem'
								}}
							/>
							<button
								className="btn border-0"
								type="button"
								style={{
									backgroundColor: '#d4a574',
									color: '#6b4423'
								}}
							>
								<i className="fas fa-search"></i>
							</button>
						</div>
						{/* Botones de usuario */}
						{ !store?.token ? (
							<>
								{ (location.pathname !== '/login') && (
									<Link to="/Login">
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
								{ (location.pathname !== '/signup') && ( 
									<Link to="/register">
										<button
											className="btn btn-sm me-2 px-3 py-2"
											style={{backgroundColor: '#d4a574',color: '#6b4423', border: 'none',borderRadius: '6px', fontWeight: '500',	transition: 'all 0.2s ease'	}}
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
							</>
						):( 
							<>
								<Link to="/userprofile/me"> <span className="me-2"> <i className="fa-solid fa-user display-6 me-2"></i>{store.user} </span> </Link>
								<button className="btn btn-secondary my-1 w-100" onClick={handleLogout}>Logout</button>
							</>
						)}
{/* Botón para proveedores */}
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
								Para Negocios
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
										to="/provider/register"
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
										<span>Registrar Cafetería</span>
									</Link>
								</li>
								<li>
									<Link
										to="/provider/login"
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
										<span>Acceso Proveedores</span>
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
										to="/admin"
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
					</div>
				</div>
			</div>
		</nav>
	);
};