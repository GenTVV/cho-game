window.addEventListener("DOMContentLoaded", () => {
  if (typeof updateTopbar === "function") updateTopbar();
  if (typeof updateXPUI === "function") updateXPUI();
});