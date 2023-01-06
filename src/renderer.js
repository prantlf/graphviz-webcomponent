import { Graphviz } from "@hpcc-js/wasm/graphviz";

let graphviz;
let fatalError;

async function receiveRequest({ data }) {
  const { script, render_id } = data;
  if (script === undefined) return; // prevent endless message loop in tests
  if (fatalError) return postMessage({ error: fatalError, render_id });
  try {
    if (!graphviz) graphviz = await Graphviz.load();
    const svg = graphviz.dot(script);
    postMessage({ svg, render_id });
  } catch ({ message }) {
    postMessage({ error: { message }, render_id });
  }
}

function handleRejection(event) {
  event.preventDefault();
  const { message } = event.reason;
  const error = { message: `Graphviz failed. ${message}` };
  if (message.includes("fetching of the wasm failed")) fatalError = error;
  postMessage({ error });
}

addEventListener("message", receiveRequest);
addEventListener("unhandledrejection", handleRejection);
