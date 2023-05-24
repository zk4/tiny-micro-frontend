import WujieReact from "wujie-react";
import {
	HashRouter as Router,
	Route,
	Routes,
	NavLink,
	Navigate,
	useLocation,
	useNavigate,
} from "react-router-dom";

import "./App.css";

const { bus } = WujieReact;
bus.$on("click", (msg) => window.alert(msg));

const props = {
	jump: (name) => {
		alert("hello");
	},
	alert: (text) => {
		alert(text);
	},
};
function Nav() {
	return (
		<nav>
			<NavLink to="/" className={({ isActive }) => (isActive ? "active" : "inactive")} > Home </NavLink>
			<NavLink to="/vite" className={({ isActive }) => (isActive ? "active" : "inactive")} > Vite </NavLink>
		</nav>
	);
}

function App() {
	return (
		<div className="App">
			<h1>Wujie Expermient</h1>
			<Router>
				<Nav/>
				<Routes>
					<Route>
						<Route exact path="/" element={ <WujieReact
									width="100%"
									props={props}
									height="100%"
									name="browser"
									url={"http://localhost:7200"}
								/>
							}
						/>
						<Route path="/vite" element={ <WujieReact
									width="100%"
									props={props}
									height="100%"
									name="vite"
									url={"http://localhost:7500"}
								/>
							}
						/>
					</Route>
				</Routes>
			</Router>
		</div>
	);
}

export default App;
