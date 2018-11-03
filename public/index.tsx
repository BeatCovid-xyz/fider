import React from "react";
import ReactDOM from "react-dom";
import { resolveRootComponent } from "@fider/router";
import { Header, Footer } from "@fider/components/common";
import { ErrorBoundary } from "@fider/components";
import { classSet, Fider, actions, navigator } from "@fider/services";
import { ToastContainer, toast } from "react-toastify";

import "semantic-ui-css/components/reset.min.css";
import "semantic-ui-css/components/icon.min.css";

import "react-toastify/dist/ReactToastify.css";
import "@fider/assets/styles/main.scss";

const logProductionError = (err: Error) => {
  if (Fider.isProduction()) {
    console.error(err); // tslint:disable-line
    actions.logError(err.message, err);
  }
};

window.addEventListener("error", (evt: ErrorEvent) => {
  if (evt.error && evt.colno > 0 && evt.lineno > 0) {
    actions.logError(evt.message, evt.error);
  }
});

(() => {
  let fider;

  if (!navigator.isBrowserSupported()) {
    navigator.goTo("/browser-not-supported");
    return;
  }

  try {
    fider = Fider.initialize();

    __webpack_nonce__ = fider.session.contextID;
    __webpack_public_path__ = `${fider.settings.globalAssetsURL}/assets/`;
  } catch (err) {
    actions
      .logError(err.message || "An unhandled error occurred", err.error)
      .then(() => navigator.goTo("/browser-not-supported"))
      .catch(() => navigator.goTo("/browser-not-supported"));
    return;
  }

  const config = resolveRootComponent(location.pathname);
  document.body.className = classSet({
    "is-authenticated": fider.session.isAuthenticated,
    "is-staff": fider.session.isAuthenticated && fider.session.user.isCollaborator
  });
  ReactDOM.render(
    <ErrorBoundary onError={logProductionError}>
      <ToastContainer position={toast.POSITION.TOP_RIGHT} toastClassName="c-toast" />
      {config.showHeader && <Header />}
      {React.createElement(config.component, fider.session.props)}
      {config.showHeader && <Footer />}
    </ErrorBoundary>,
    document.getElementById("root")
  );
})();
