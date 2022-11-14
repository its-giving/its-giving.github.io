/* QUERY PARAMS */
const queryParam = (key) => new URLSearchParams(document.location.search).get(key);
const queryParams = (...keys) => keys.map(k => ({[k]: queryParam(k)})).reduce((acc, e) => ({...acc, ...e}));

/* APP URL */
const getOrgAppUrl = org => `https://github.com/organizations/${org}/settings/apps/new`;
const getUserAppUrl = () => `https://github.com/settings/apps/new`;
const getAppUrl = organization => organization ? getOrgAppUrl(organization) : getUserAppUrl();

/* DOM UTILS */
const createElement = (tag, options) => {
  const el = document.createElement(tag);
  for (const k of options) {
    el.setAttribute(k, options[k]);
  }
  return el;
}


const renderForm = (actionUrl, manifest, hideManifest) => {
  const form = createElement(el, { method: "post", action: actionUrl });
  form.appendChild(createElement("input", { type: hideManifest ? "hidden" : "text", name: "manifest", value: JSON.stringify(manifest) }));
  form.appendChild(createElement("input", { type: "submit" }));
  return form;
}


const initiate = ({organization, manifest, hideManifest}) => {
	const manifestString = JSON.stringify(manifest);
  const appUrl = getAppUrl(organization);
  document.body.appendChild(renderForm(appUrl, manifest, hideManifest));
}

document.body.addEventListener("load", () => {
  const CONFIG = queryParams("manifest", "organization", "state", "hideManifest");
  if (!CONFIG["state"]) {
    initiate(CONFIG);
  }
});
