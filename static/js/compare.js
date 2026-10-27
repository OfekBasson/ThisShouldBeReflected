// Before/after comparison viewer for the qualitative results.
// Images live in static/images/results/<scene>/<method>.jpg and are pixel-aligned.

const METHODS = [
  { key: "input",        label: "Input" },
  { key: "qwen",         label: "Qwen-Image-2.1" },
  { key: "flux1fill",    label: "FLUX.1 Fill" },
  { key: "flux2",        label: "FLUX.2" },
  { key: "mirrorfusion", label: "MirrorFusion 2.0" },
  { key: "ours",         label: "Ours" },
  { key: "gt",           label: "Ground truth" },
];

const SCENES = [
  { id: "2705", caption: "FLUX.1 Fill and MirrorFusion 2.0 add blurred artifacts, and MirrorFusion 2.0 reflects the object inaccurately." },
  { id: "4118", caption: "Qwen-Image-2.1, FLUX.1 Fill, and Ours reflect the paving, but only Ours matches the orientation and positioning of the ground truth." },
  { id: "1525", caption: "Only Ours reflects the empty floor, as in the ground truth; the others reflect objects that the mirror cannot show from this viewpoint." },
  { id: "2135", caption: "Only Ours reflects the thermostat and the switch at the correct angle." },
  { id: "1485", caption: "Only Ours reflects the stone path at the correct angle and structure." },
  { id: "1210", caption: "Only Ours reflects the railing post at the angle of the ground truth." },
  { id: "5151", caption: "" },
  { id: "685",  caption: "" },
  { id: "1151", caption: "" },
  { id: "1329", caption: "" },
  { id: "765",  caption: "" },
  { id: "1596", caption: "" },
];

const state = { scene: SCENES[0].id, left: "qwen", right: "ours", pos: 50 };

const $ = id => document.getElementById(id);
const src = (scene, method) => `./static/images/results/${scene}/${method}.jpg`;
const labelOf = key => METHODS.find(m => m.key === key).label;

function setPos(p) {
  state.pos = Math.max(0, Math.min(100, p));
  $("cmp-left").style.clipPath = `inset(0 ${100 - state.pos}% 0 0)`;
  $("cmp-handle").style.left = state.pos + "%";
}

function render() {
  $("cmp-left").src = src(state.scene, state.left);
  $("cmp-right").src = src(state.scene, state.right);
  $("cmp-left").alt = labelOf(state.left);
  $("cmp-right").alt = labelOf(state.right);
  for (const side of ["left", "right"]) {
    const lbl = $("lbl-" + side);
    lbl.textContent = labelOf(state[side]);
    lbl.classList.toggle("ours", state[side] === "ours");
    const other = state[side === "left" ? "right" : "left"];
    $("pick-" + side).querySelectorAll(".chip").forEach(c => {
      c.classList.toggle("active", c.dataset.key === state[side]);
      c.disabled = c.dataset.key === other;
    });
  }
  $("scene-caption").textContent = SCENES.find(s => s.id === state.scene).caption;
  $("thumbs").querySelectorAll(".thumb").forEach(t => t.classList.toggle("active", t.dataset.id === state.scene));
}

function buildPickers() {
  for (const side of ["left", "right"]) {
    const box = $("pick-" + side);
    METHODS.forEach(m => {
      const b = document.createElement("button");
      b.className = "chip" + (m.key === "ours" ? " ours" : "");
      b.dataset.key = m.key;
      b.textContent = m.label;
      b.addEventListener("click", () => { state[side] = m.key; render(); });
      box.appendChild(b);
    });
  }
}

function buildThumbs() {
  const box = $("thumbs");
  SCENES.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "thumb";
    b.dataset.id = s.id;
    b.title = `Photo ${i + 1}`;
    b.innerHTML = `<img src="${src(s.id, "input")}" alt="Test photo ${i + 1}" loading="lazy">`;
    b.addEventListener("click", () => { state.scene = s.id; render(); });
    box.appendChild(b);
  });
}

function bindSlider() {
  const wrap = $("compare");
  const fromEvent = e => {
    const r = wrap.getBoundingClientRect();
    setPos((e.clientX - r.left) / r.width * 100);
  };
  let dragging = false;
  wrap.addEventListener("pointerdown", e => { dragging = true; wrap.setPointerCapture(e.pointerId); fromEvent(e); });
  wrap.addEventListener("pointermove", e => { if (dragging || e.pointerType === "mouse") fromEvent(e); });
  wrap.addEventListener("pointerup", () => { dragging = false; });
  wrap.addEventListener("pointercancel", () => { dragging = false; });
}

document.addEventListener("DOMContentLoaded", () => {
  buildPickers();
  buildThumbs();
  bindSlider();
  // Portrait photos would be very tall at full width: cap the viewer height at 560 px.
  $("cmp-right").addEventListener("load", e => {
    const img = e.target;
    $("compare").style.maxWidth = Math.round(560 * img.naturalWidth / img.naturalHeight) + "px";
  });
  setPos(50);
  render();
});
