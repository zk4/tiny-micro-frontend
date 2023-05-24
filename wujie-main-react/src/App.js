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
	const navigation = useNavigate();

	// 在 xxx-sub 路由下子应用将激活路由同步给主应用，主应用跳转对应路由高亮菜单栏
	// bus.$on("sub-route-change", (name, path) => {
	//   const mainName = `${name}-sub`;
	//   const mainPath = `/${name}-sub${path}`;
	//   const currentPath = window.location.hash.replace("#", "");
	//   if (currentPath.includes(mainName) && currentPath !== mainPath) {
	//     console.log("mainPath",mainPath)
	//     navigation(mainPath);
	//   }
	// });

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
			<h1>this is good sign</h1>
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
