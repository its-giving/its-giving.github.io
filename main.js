/* QUERY PARAMS */
const queryParam = (key) => new URLSearchParams(document.location.search).get(key);
const queryParams = (...keys) => keys.map(k => ({[k]: queryParam(k)})).reduce((acc, e) => ({...acc, ...e}));

/* URLS - APP URL */
const getOrgAppUrl = org => `https://github.com/organizations/${org}/settings/apps/new`;
const getUserAppUrl = () => `https://github.com/settings/apps/new`;
const getAppUrl = organization => organization ? getOrgAppUrl(organization) : getUserAppUrl();

/* URLS - APP REGISTRATION API */
const getRegistrationUrl = code => `https://api.github.com/app-manifests/${code}/conversions`;

/* DOM UTILS */
const createElement = (tag, attributes) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attributes || {})) {
    el.setAttribute(k, v);
  }
  return el;
}

/* INITIATE FLOW */
const renderForm = (actionUrl, manifest, hideManifest) => {
  const form = createElement("form", { method: "post", action: actionUrl });
  form.appendChild(createElement("input", { type: hideManifest ? "hidden" : "text", name: "manifest", value: manifest ? JSON.stringify(manifest) : "" }));
  form.appendChild(createElement("input", { type: "submit" }));
  return form;
}

const overrideManifestRedirect = (manifest) => ({
	...manifest,
	redirect_url: window.location.origin,
})

const initiate = ({organization, manifest, hideManifest}) => {
  try {
		const manifestObj = !!manifest && manifest.length > 0 ? JSON.parse(manifest) : {};
		const manifestString = JSON.stringify(overrideManifestRedirect(manifestObj));
  	const appUrl = getAppUrl(organization);
  	document.body.appendChild(renderForm(appUrl, manifestString, hideManifest));
	} catch (e) {
		const div = createElement("div");
		div.innerText = `ERROR: ${e}`;
		document.body.appendChild(div);
	}
}

/* AFTER-REDIRECT FLOW */
const eachKey = (obj, callback, base = "") => {
	for (let [k, v] of Object.entries(obj)) {
		const fullKey = `${base}.${k}`;
		if (typeof v === "object") {
			eachKey(v, callback, fullKey);
		} else if (Array.isArray(v)) {
			callback(fullKey, v.join(", "));
		} else {
			callback(fullKey, v.toString());
		}
	}
}
const renderTable = (bodyJson) => {
  const table = createElement("table");
	eachKey(bodyJson, (k, v) => {
		const tr = createElement("tr");
		const kCell = createElement("td");
		kCell.innerText = k;
		tr.appendChild(kCell);
		const vCell = createElement("td");
		vCell.innerText = v;
		tr.appendChild(vCell);
		table.appendChild(tr);
	});
  return table;
}
const registerApp = async (registrationCode) => {
	const res = await fetch(getRegistrationUrl(registrationCode), { method: "post" });
	const body = await res.json();
	document.body.appendChild(renderTable(body));
};

window.addEventListener("load", () => {
  const CONFIG = queryParams("manifest", "organization", "code", "hideManifest");
	const registrationCode = CONFIG["code"];
  if (!registrationCode) {
    // No code means we weren't redirected. This is the beginning of the Github App Manifest flow.
    initiate(CONFIG);
  } else {
		registerApp(registrationCode);
  }
});
