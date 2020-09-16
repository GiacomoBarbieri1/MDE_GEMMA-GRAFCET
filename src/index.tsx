import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

library.add(faChevronDown, faChevronUp, faTrashAlt);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
