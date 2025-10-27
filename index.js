const {
  ul,
  li,
  a,
  span,
  hr,
  div,
  text,
  i,
  h6,
  h2,
  h3,
  h1,
  p,
  header,
  footer,
  mkTag,
  button,
  nav,
  img,
  aside,
  form,
  input,
  section,
} = require("@saltcorn/markup/tags");
const {
  navbar,
  navbarSolidOnScroll,
  headersInHead,
  headersInBody,
  alert,
  activeChecker,
} = require("@saltcorn/markup/layout_utils");
const renderLayout = require("@saltcorn/markup/layout");
const Form = require("@saltcorn/data/models/form");
const Workflow = require("@saltcorn/data/models/workflow");
const { renderForm, link } = require("@saltcorn/markup");
const { features, getState } = require("@saltcorn/data/db/state");
const Plugin = require("@saltcorn/data/models/plugin");
const User = require("@saltcorn/data/models/user");
const db = require("@saltcorn/data/db");
const { sleep } = require("@saltcorn/data/utils");

const verstring = features?.version_plugin_serve_path
  ? "@" + require("./package.json").version
  : "";

// when the function from base is not yet available
const _activeChecker = activeChecker
  ? activeChecker
  : (link, currentUrl) => new RegExp(`^${link}(\\/|\\?|#|$)`).test(currentUrl);

const active = (currentUrl, item) =>
  (item.link && _activeChecker(item.link, currentUrl)) ||
  (item.altlinks && item.altlinks.some((l) => _activeChecker(l, currentUrl))) ||
  (item.subitems &&
    item.subitems.some(
      (si) =>
        (si.link && _activeChecker(si.link, currentUrl)) ||
        (si.altlinks && si.altlinks.some((l) => _activeChecker(l, currentUrl)))
    ));

const horizontalLineItem = (classes = []) =>
  div(
    { class: ["w-100 flex-shrink-0", ...classes] },
    hr({ class: ["hr my-1"] })
  );

const horizontalSubItem = (currentUrl) => (item) =>
  li(
    item.link
      ? a(
          {
            class: ["dropdown-item", active(currentUrl, item) && "active"],
            href: text(item.link),
          },
          item.icon && item.icon !== "empty" && item.icon !== "undefined"
            ? i({
                class: `me-1 fa-fw ${item.icon} object-fit-contain`,
                style: "width: 16px; height: 16px;",
              })
            : "",
          item.label
        )
      : span({ class: "dropdown-header" }, item.label)
  );

const verticalSubItem = (currentUrl) => (item) =>
  li(
    { class: ["nav-item"] },
    item.link
      ? a(
          {
            class: [
              "nav-link m-0 rounded-0 ripple",
              active(currentUrl, item) && "active",
            ],
            href: text(item.link),
          },
          item.icon && item.icon !== "empty" && item.icon !== "undefined"
            ? i({
                class: `me-2 fa-fw ${item.icon} object-fit-contain`,
                style: "width: 16px; height: 16px;",
              })
            : "",
          item.label
        )
      : span(
          {
            class: [
              "nav-link m-0 rounded-0",
              active(currentUrl, item) && "active",
            ],
          },
          text(item.label)
        )
  );

const verticalSideBarItem =
  (currentUrl, config, user, nitems) => (item, ix) => {
    const is_active = active(currentUrl, item);
    if (
      item.isUser &&
      config?.avatar_file &&
      user &&
      user[config?.avatar_file]
    ) {
      return li(
        {
          class: ["nav-item dropdown", is_active && "active"],
        },
        a(
          {
            class: "nav-link m-0",
            href: "#",
            "data-bs-toggle": "dropdown",
            role: "button",
            "aria-expanded": "false",
          },
          span({
            class:
              "avatar avatar-sm fs-4 m-0 bg-body-secondary text-muted-fg border border-1",
            style: `background-image: url(/files/resize/64/64/${
              user?.[config.avatar_file]
            })`,
          })
        ),
        ul(
          {
            class: ["dropdown-menu", ix === nitems - 1 && "dropdown-menu-end"],
          },
          item.subitems.map(horizontalSubItem(currentUrl))
        )
      );
    } else if (item.isUser && user?.email) {
      return li(
        {
          class: ["nav-item dropdown", is_active && "active"],
        },
        a(
          {
            class: "nav-link m-0",
            href: "#",
            "data-bs-toggle": "dropdown",
            role: "button",
            "aria-expanded": "false",
          },
          div(
            {
              class: "fs-4 m-0 bg-body-secondary text-muted-fg border border-1",
              style:
                "border-radius: 50%; width: 40px; height:40px; display: flex;align-items: center; justify-content: center;",
            },
            user.email[0].toUpperCase()
          )
        ),
        ul(
          {
            class: ["dropdown-menu", ix === nitems - 1 && "dropdown-menu-end"],
          },
          item.subitems.map(horizontalSubItem(currentUrl))
        )
      );
    }
    {
      return li(
        {
          class: ["nav-item"],
        },
        item.type === "Separator"
          ? horizontalLineItem()
          : item.type === "Search"
          ? form(
              {
                action: "/search",
                class: "menusearch ms-2",
                method: "get",
                autocomplete: "off",
                novalidate: "",
              },
              div(
                { class: "input-icon" },
                span(
                  { class: "input-icon-addon" },
                  i({ class: "fas fa-search" })
                ),
                input({
                  type: "text",
                  value: "",
                  class: "form-control",
                  placeholder: "Search…",
                  "aria-label": "Search in website",
                })
              )
            )
          : item.subitems
          ? [
              a(
                {
                  class: ["nav-link m-0 d-flex align-items-center ripple"],
                  href: "#collapse_item_" + ix,
                  role: "button",
                  "data-bs-toggle": "collapse",
                  "aria-expanded": "false",
                  "aria-controls": "collapse_item_" + ix,
                },
                //i({ class: "fas fa-fw fa-wrench" }),
                item.icon && item.icon !== "empty" && item.icon !== "undefined"
                  ? span(
                      { class: "me-2" },
                      i({
                        class: `fa-fw ${item.icon} object-fit-contain`,
                        style: "width: 16px; height: 16px;",
                      })
                    )
                  : "",
                item.label,
                span(
                  { class: "ms-auto" },
                  i({
                    class: "sidenav-collapse-icon fas fa-chevron-down fa-sm",
                  })
                )
              ),
              div(
                {
                  class: ["collapse", is_active && "show"],
                  id: "collapse_item_" + ix,
                },
                ul(
                  { class: "nav w-100 d-flex flex-column" },
                  item.subitems.map(verticalSubItem(currentUrl))
                )
              ),
            ]
          : a(
              {
                class: [
                  item.style && item.style.includes("btn")
                    ? "ms-2"
                    : "nav-link",
                  "m-0 ripple",
                  item.style || "",
                  is_active && "active",
                ],
                href: text(item.link),
                ...(is_active && { "aria-current": "page" }),
              },
              item.icon && item.icon !== "empty" && item.icon !== "undefined"
                ? span(
                    { class: "me-2" },
                    i({
                      class: `fa-fw ${item.icon} object-fit-contain`,
                      styyle: "width: 16px; height: 16px;",
                    })
                  )
                : "",
              text(item.label)
            )
      );
    }
  };

const sideBarSection = (currentUrl, config, user) => (section) =>
  [
    section.items
      .map(verticalSideBarItem(currentUrl, config, user, section.items.length))
      .join(""),
  ];

const splitPrimarySecondaryMenu = (menu) => {
  return {
    primary: menu
      .map((mi) => ({
        ...mi,
        items: mi.items.filter(
          (item) => item.location !== "Secondary Menu" && mi.section !== "User"
        ),
      }))
      .filter(({ items }) => items.length),
    secondary: menu
      .map((mi) => ({
        ...mi,
        items: mi.items.filter(
          (item) => item.location === "Secondary Menu" || mi.section === "User"
        ),
      }))
      .filter(({ items }) => items.length),
  };
};

const showBrand = (brand, config) =>
  a(
    {
      href: "/",
      class: "navbar-brand navbar-brand-autodark d-none-navbar-horizontal",
    },
    brand.logo &&
      img({
        src: brand.logo,
        alt: "Logo",
        class: "navbar-brand-image mx-1",
      }),
    !config?.hide_site_name && brand.name
  );

const isNode = typeof window === "undefined";

const blockDispatch = (config) => ({
  pageHeader: ({ title, blurb }) =>
    div(
      h1(
        {
          class: `h3 mb-0 mt-2 text-${
            config.mode === "dark" ? "light" : "gray-800"
          }`,
        },
        title
      ),
      blurb &&
        p(
          {
            class: `mb-0 text-${config.mode === "dark" ? "light" : "gray-800"}`,
          },
          blurb
        )
    ),
  footer: ({ contents }) =>
    div(
      { class: "container-xl" },
      footer(
        { id: "footer" },
        div({ class: "row" }, div({ class: "col-sm-12" }, contents))
      )
    ),
  hero: ({ caption, blurb, cta, backgroundImage }) =>
    section(
      {
        class:
          "jumbotron text-center m-0 bg-info d-flex flex-column justify-content-center",
      },
      div(
        { class: "container-xl" },
        h1({ class: "jumbotron-heading" }, caption),
        p({ class: "lead" }, blurb),
        cta
      ),
      backgroundImage &&
        style(`.jumbotron {
        background-image: url("${backgroundImage}");
        background-size: cover;
        min-height: 75vh !important;
      }`)
    ),
  noBackgroundAtTop: () => true,
  wrapTop: (segment, ix, s) =>
    ["hero", "footer"].includes(segment.type) || segment.noWrapTop
      ? s
      : section(
          {
            class: [
              "page-section",
              "fw-check",
              ix === 0 && `pt-${config.toppad || 0}`,
              ix === 0 &&
                config.fixedTop &&
                config.layout_style !== "Vertical" &&
                isNode &&
                "mt-6",
              ix === 0 &&
                config.fixedTop &&
                config.layout_style !== "Vertical" &&
                !isNode &&
                "mt-5",
              segment.class,
              segment.invertColor && "bg-primary",
            ],
            style: `${
              segment.bgType === "Color"
                ? `background-color: ${segment.bgColor};`
                : ""
            }`,
          },
          div(
            { class: [config.fluid ? "container-fluid" : "container"] },
            segment.textStyle && segment.textStyle === "h1" ? h1(s) : s
          )
        ),
});

const renderBody = (title, body, alerts, config, role) =>
  renderLayout({
    blockDispatch: blockDispatch(config),
    role,
    layout:
      typeof body === "string" && config.in_card
        ? { type: "card", title, contents: body }
        : body,
    alerts,
  });

const wrapIt = (config, bodyAttr, headers, title, body) => {
  const primary =
    (config?.mode === "light"
      ? config?.primary_color_light
      : config?.mode === "dark"
      ? config?.primary_color_dark
      : config?.primary_color) || "#3b71ca";
  const secondary =
    (config?.mode === "light"
      ? config?.secondary_color_light
      : config?.mode === "dark"
      ? config?.secondary_color_dark
      : config?.secondary_color) || "#9fa6b2";
  const hexToRgb = (hex) => {
    let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (cleanHex.length !== 6) {
      throw new Error("Invalid hex color format. Expected 3 or 6 digits.");
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };
  const primary_rgb = hexToRgb(primary);
  const secondary_rgb = hexToRgb(secondary);
  const adjustColor = (hex, { h = 0, s = 0, l = 0, a = 1 } = {}) => {
    let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    // RGB -> HSL
    const rNorm = r / 255,
      gNorm = g / 255,
      bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let hVal,
      sVal,
      lVal = (max + min) / 2;

    if (max === min) {
      hVal = sVal = 0;
    } else {
      const d = max - min;
      sVal = lVal > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          hVal = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          hVal = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          hVal = (rNorm - gNorm) / d + 4;
          break;
      }
      hVal /= 6;
    }

    // Apply adjustments
    hVal = ((hVal * 360 + h) % 360) / 360;
    sVal = Math.min(1, Math.max(0, sVal + s / 100));
    lVal = Math.min(1, Math.max(0, lVal + l / 100));

    // HSL -> RGB
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let rOut, gOut, bOut;
    if (sVal === 0) {
      rOut = gOut = bOut = lVal;
    } else {
      const q = lVal < 0.5 ? lVal * (1 + sVal) : lVal + sVal - lVal * sVal;
      const p = 2 * lVal - q;
      rOut = hue2rgb(p, q, hVal + 1 / 3);
      gOut = hue2rgb(p, q, hVal);
      bOut = hue2rgb(p, q, hVal - 1 / 3);
    }

    const rFinal = Math.round(rOut * 255);
    const gFinal = Math.round(gOut * 255);
    const bFinal = Math.round(bOut * 255);

    // If alpha < 1, return rgba, else hex
    if (a < 1) {
      return `rgba(${rFinal}, ${gFinal}, ${bFinal}, ${a})`;
    }

    return (
      "#" +
      [rFinal, gFinal, bFinal]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  const link_cover_color = adjustColor(primary, { l: -3 });
  const mdb_btn_color = adjustColor(primary, { l: +15 });
  const mdb_btn_outline_focus_border_color = adjustColor(primary, { l: +25 });
  const mdb_btn_outline_border_color = adjustColor(primary, { l: +30 });
  const mdb_btn_hover_color = adjustColor(primary, { l: +40 });
  const mdb_btn_hover_bg = adjustColor(primary, { l: -40 });
  const mdb_btn_color_hue = adjustColor(primary, { h: -10, l: +10 });
  const mdb_btn_color_secondary = adjustColor(primary, { l: -16 });

  return `<!doctype html>
<html lang="en" data-bs-theme="${config.mode === "auto" ? "" : config.mode}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css">
    <!-- Google Fonts -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap">
    <!-- Material Design Bootstrap -->
    <link href="/plugins/public/material-design${verstring}/css/mdb.min.css" rel="stylesheet">
    <!-- Plugin Custom Styles -->
    <link href="/plugins/public/material-design${verstring}/css/sidenav.css" rel="stylesheet">
    ${headersInHead(headers)}
    <style>
    :root,
    [data-bs-theme="light"] {
      --mdb-primary: ${primary};
      --mdb-secondary: ${secondary};
      --mdb-primary-rgb: ${primary_rgb};
      --mdb-secondary-rgb: ${secondary_rgb};
      --mdb-link-hover-color: ${link_cover_color};
      --mdb-link-color-rgb: ${primary_rgb};
      --mdb-link-hover-color-rgb: ${link_cover_color};
      --mdb-primary-text-emphasis: ${adjustColor(primary, { l: -10 })};
      --mdb-primary-bg-subtle: ${adjustColor(primary, { l: +25 })};
      /* --mdb-link-color: ${adjustColor(primary, { l: +50 })}; */
    }
    [data-bs-theme="dark"] {
      --mdb-primary: ${primary};
      --mdb-secondary: ${secondary};
      --mdb-btn-color: ${mdb_btn_color};
      --mdb-link-hover-color: ${link_cover_color};
      --mdb-link-hover-color-rgb: ${link_cover_color};
      /* --mdb-link-color: ${adjustColor(primary, { l: +50 })}; */
      --mdb-secondary-text-emphasis: ${adjustColor(primary, { l: +65 })};
    }
    [data-bs-theme="dark"] .btn-outline-secondary {
      --mdb-btn-color: ${mdb_btn_color_hue};
      --mdb-btn-hover-bg: ${adjustColor(primary, { l: 20, a: 0.1 })};
      --mdb-btn-hover-color: ${mdb_btn_hover_color};
      --mdb-btn-focus-bg: ${adjustColor(primary, { l: 20, a: 0.5 })};
      --mdb-btn-focus-color: ${mdb_btn_hover_color};
      --mdb-btn-active-bg: ${adjustColor(primary, { l: 10, a: 0.4 })};
      --mdb-btn-active-color: ${mdb_btn_hover_color};
      --mdb-btn-outline-border-color: ${mdb_btn_outline_border_color};
      --mdb-btn-outline-focus-border-color: ${mdb_btn_outline_focus_border_color};
      --mdb-btn-outline-hover-border-color: ${mdb_btn_outline_focus_border_color};
      --mdb-btn-active-border-color: ${mdb_btn_outline_focus_border_color};
    }
    [data-bs-theme="light"] .btn-outline-secondary {
      --mdb-btn-color: ${mdb_btn_color_hue};
      --mdb-btn-hover-bg: ${adjustColor(primary, { l: 20, a: 0.1 })};
      --mdb-btn-hover-color: ${adjustColor(primary, { l: +5 })};
      --mdb-btn-focus-bg: ${adjustColor(primary, { l: 20, a: 0.2 })};
      --mdb-btn-focus-color: ${mdb_btn_hover_color};
      --mdb-btn-active-bg: ${adjustColor(primary, { l: 10, a: 0.2 })};
      --mdb-btn-active-color: ${adjustColor(primary, { l: -5 })};
      --mdb-btn-outline-border-color: ${mdb_btn_outline_border_color};
      --mdb-btn-outline-focus-border-color: ${mdb_btn_outline_focus_border_color};
      --mdb-btn-outline-hover-border-color: ${mdb_btn_outline_focus_border_color};
    }
    [data-bs-theme="dark"] .btn-outline-primary {
      --mdb-btn-color: ${adjustColor(primary, { l: +15 })};
      --mdb-btn-hover-bg: ${adjustColor(primary, { l: -50 })};
      --mdb-btn-hover-color: ${adjustColor(primary, { l: -5 })};
      --mdb-btn-focus-bg: ${adjustColor(primary, { l: -50 })};
      --mdb-btn-focus-color: ${adjustColor(primary, { l: -5 })};
      --mdb-btn-active-bg: ${adjustColor(primary, { l: -50 })};
      --mdb-btn-active-color: ${adjustColor(primary, { l: -8 })};
    }
    .btn-outline-primary {
      --mdb-btn-hover-bg: ${adjustColor(primary, { l: +42 })};
      --mdb-btn-hover-color: ${adjustColor(primary, { l: -5 })};
      --mdb-btn-focus-bg: ${adjustColor(primary, { l: +42 })};  
      --mdb-btn-focus-color: ${adjustColor(primary, { l: -5 })};
      --mdb-btn-active-bg: ${adjustColor(primary, { l: +42 })}; 
      --mdb-btn-active-color: ${adjustColor(primary, { l: -8 })};
      --mdb-btn-outline-focus-border-color: ${adjustColor(primary, { l: -10 })};
      --mdb-btn-outline-hover-border-color: ${adjustColor(primary, { l: -10 })};
    }
    [data-bs-theme=dark] .btn-secondary {
      --mdb-btn-bg: ${mdb_btn_hover_color};
      --mdb-btn-hover-bg: ${mdb_btn_outline_border_color};
      --mdb-btn-focus-bg: ${mdb_btn_outline_border_color};
      --mdb-btn-active-bg: ${mdb_btn_outline_border_color};
    }
    .btn-secondary {
      --mdb-btn-bg: ${mdb_btn_hover_color};
      --mdb-btn-hover-bg: ${mdb_btn_outline_border_color};
      --mdb-btn-focus-bg: ${mdb_btn_outline_border_color};
      --mdb-btn-active-bg: ${mdb_btn_outline_border_color};
      --mdb-btn-color: ${mdb_btn_color_secondary};
      --mdb-btn-hover-color: ${mdb_btn_color_secondary};
      --mdb-btn-focus-color: ${mdb_btn_color_secondary};
      --mdb-btn-active-color: ${mdb_btn_color_secondary};
    }
    .btn-primary {
      --mdb-btn-hover-bg: ${link_cover_color};
      --mdb-btn-active-bg: ${link_cover_color};
      --mdb-btn-focus-bg: ${link_cover_color};
    }
    .dropdown-menu.dropdown-menu-end {
      max-width: fit-content;
    }
    /* Search component in "Page Configuration" */
    [data-bs-theme="dark"] input.form-control.bg-light {
      background-color: var(--mdb-dark) !important;
      color: var(--mdb-light) !important;
    }
    [data-bs-theme="dark"] .css-26l3qy-menu {
      background-color: var(--mdb-dark) !important;
      border: 1px solid var(--mdb-dark-border-subtle) !important;
    }
    [data-bs-theme="dark"] .css-yt9ioa-option:hover {
      background-color: #424242 !important;
      color: var(--mdb-light) !important;
    }
    [data-bs-theme="dark"] .css-1n7v3ny-option {
      background-color: #424242 !important;
    }
    [data-bs-theme="dark"] .css-yk16xz-control {
      background-color: #333;
      border-color: var(--mdb-dark-border-subtle) !important;
    }
    [data-bs-theme="dark"] .css-1pahdxg-control {
      background-color: #333 !important;
    }
    [data-bs-theme="dark"] .css-1uccc91-singleValue {
      color: #fefefe !important;
    }
    [data-bs-theme="dark"] .css-8mmkcg {
      fill: #ccc !important;
    }
    /* Icons selector */
    [data-bs-theme="dark"] .rfipbtn--default {
      background-color: var(--mdb-dark);
      border: 1px solid var(--mdb-dark-border-subtle);
    }
    [data-bs-theme="dark"] .rfipbtn--default .rfipbtn__button {
      border-left: 1px solid var(--mdb-dark-border-subtle);
      background-color: var(--mdb-dark-bg-subtle);
      color: #e0e0e0;
    }
    [data-bs-theme="dark"] .rfipbtn--default .rfipbtn__button:hover {
      background-color: var(--mdb-dark-bg-subtle);
      color: #e0e0e0;
    }
    [data-bs-theme="dark"] .rfipbtn--default:active,
    [data-bs-theme="dark"] .rfipbtn--default:focus {
      border: 1px solid var(--mdb-primary);
    }
    [data-bs-theme="dark"] .rfipdropdown--default {
      -webkit-box-shadow: 0 15px 24px rgba(0, 0, 0, .22), 0 19px 76px rgba(0, 0, 0, .3);
      box-shadow: 0 15px 24px rgba(0, 0, 0, .22), 0 19px 76px rgba(0, 0, 0, .3);
      color: var(--mdb-light);
      background-color: var(--mdb-dark);
      border: 1px solid var(--mdb-dark-border-subtle);
    }
    [data-bs-theme="dark"] .rfipdropdown--default input, .rfipdropdown--default select {
      color: var(--mdb-light);
    }
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__ibox,
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__left,
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__right {
      background-color: var(--mdb-dark-bg-subtle);
      border: 1px solid var(--mdb-dark-border-subtle);
      color: var(--mdb-light);
    }
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__ibox:hover,
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__left:hover,
    [data-bs-theme="dark"] 
      .rfipdropdown--default .rfipicons__right:hover {
      background-color: var(--mdb-dark);
      color: var(--mdb-light);
    }
    [data-bs-theme="dark"] 
    .rfipbtn--default .rfipbtn__icon {
      border: 1px solid #6a6a6a;
      color: var(--mdb-light);
    }
    [data-bs-theme="dark"] 
    .rfipbtn--default .rfipbtn__del {
      background-color: #6a6a6a;
    }  
    [data-bs-theme="dark"] 
    .rfipbtn--default .rfipbtn__del:hover {
        background-color: #8e8e8e;
    }
    [data-bs-theme="dark"] 
    .rfipdropdown--default .rfipicons__icon--selected .rfipicons__ibox {
      background-color: var(--mdb-primary);
    }
    /* Layers section single element hover class */
    [data-bs-theme="dark"]
    .bpkdMP {
      background: var(--mdb-dark);
    }
    .btn-outline-secondary:disabled, .btn-outline-secondary.disabled, fieldset:disabled .btn-outline-secondary {
      border-color: var(--mdb-btn-disabled-color) !important;
    }
    
    section.page-section.fw-check:has(> .container > .full-page-width:first-child),
    section.page-section.fw-check:has(> .container-fluid > .full-page-width:first-child) {
      padding-top: 0 !important;
      margin-top: ${
        config.colorscheme === "" || config.colorscheme === "transparent-dark"
          ? "0"
          : "3.66rem"
      } !important;
    }

    /* Fixed-top navbar becomes overlay if first section is full-width */
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar.fixed-top,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar.fixed-top {
      background: transparent;
      box-shadow: none !important;
    }

    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar.fixed-top.scrolled,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar.fixed-top.scrolled {
      backdrop-filter: blur(2px);
    }

    /* Navbar becomes overlay automatically if first section is full-width and navbar not fixed */
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar:not(.fixed-top),
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar:not(.fixed-top) {
      position: absolute;
      top: 0; left: 0; right: 0;
      z-index: 1050;
      background: transparent;
      box-shadow: none !important;
    }
    /* Scroll state */
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar:not(.fixed-top).scrolled,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar:not(.fixed-top).scrolled {
      backdrop-filter: blur(2px);
    }

    /* Fixed-top full-width overlay (no box-shadow before scroll) */
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar.fixed-top.navbar-fw-first,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar.fixed-top.navbar-fw-first {
      background: transparent;
      box-shadow: none !important;
    }

    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar.fixed-top.navbar-fw-first.scrolled,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar.fixed-top.navbar-fw-first.scrolled {
      backdrop-filter: blur(2px);
    }

    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar:not(.fixed-top).navbar-fw-first,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar:not(.fixed-top).navbar-fw-first {
      position: absolute;
      top: 0; left: 0; right: 0;
      z-index: 1050;
      background: transparent;
      box-shadow: none !important;
    }

    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child) .navbar:not(.fixed-top).navbar-fw-first.scrolled,
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child) .navbar:not(.fixed-top).navbar-fw-first.scrolled {
      backdrop-filter: blur(2px);
    }

    /* Transparent variants (initial state before scroll) */
    .navbar.transparent-dark:not(.scrolled),
    .navbar.navbar-fw-first.transparent-dark:not(.scrolled) {
      background: transparent !important;
    }
    .navbar.transparent-dark:not(.scrolled) .navbar-nav .nav-link,
    .navbar.transparent-dark:not(.scrolled) .navbar-brand,
    .navbar.transparent-dark:not(.scrolled) .navbar-text,
    .navbar.transparent-dark:not(.scrolled) .nav-link {
      color: ${
        config.colorscheme === "transparent-dark" ? "#fff" : "#000"
      } !important;
    }
    /* Ensure toggler icon (if any) contrasts */
    .navbar.transparent-dark:not(.scrolled) .navbar-toggler {
      border-color: rgba(255,255,255,.4);
    }
    .navbar.transparent-dark:not(.scrolled) .navbar-toggler-icon {
      filter: invert(1) brightness(1.2);
    }
      
    /* fixed-top stays fixed; only non fixed-top made absolute */
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child)
      .navbar.fixed-top.navbar-fw-first:not(.scrolled),
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child)
      .navbar.fixed-top.navbar-fw-first:not(.scrolled) {
      background: transparent;
      box-shadow: none !important;
    }
    body:has(section.page-section.fw-check:first-of-type > .container > .full-page-width:first-child)
      .navbar:not(.fixed-top).navbar-fw-first:not(.scrolled),
    body:has(section.page-section.fw-check:first-of-type > .container-fluid > .full-page-width:first-child)
      .navbar:not(.fixed-top).navbar-fw-first:not(.scrolled) {
      background: transparent;
      box-shadow: none !important;
      position: absolute;
      top: 0; left: 0; right: 0;
      z-index: 1050;
    }

    /* Scrolled state subtle backdrop for transparent variants */
    .navbar.navbar-fw-first.scrolled {
      backdrop-filter: ${config.fixedTop ? "blur(2px)" : "none"};
    }
    </style>
    <title>${text(title)}</title>
  </head>
  <body ${bodyAttr} class="${config.mode === "dark" ? "bg-dark" : ""} ${
    config.fluid ? "fluid" : ""
  } ${config.fixedTop ? "fixed-top-layout" : "no-fixed-top-layout"} ${
    config.layout_style === "Vertical" ? "layout-vertical" : "layout-horizontal"
  }">
    ${body}
      <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="/plugins/public/material-design${verstring}/js/popper.min.js"></script>
    <!-- MDB core JavaScript -->
    <script type="text/javascript" src="/plugins/public/material-design${verstring}/js/mdb.min.js"></script>
    <!-- Bind window.mdb to window.bootstrap for backward compatibility -->
    <script>
      window.bootstrap = window.mdb;
      config = ${JSON.stringify(config || {})};
      const navbar = document.querySelector(".navbar");

      (function() {
        const firstFullWidth = document.querySelector(
          "section.page-section.fw-check > .container > .full-page-width:first-child, \
           section.page-section.fw-check > .container-fluid > .full-page-width:first-child"
        );
        const isTransparent =
          config.colorscheme === "" || config.colorscheme === "transparent-dark";
        const isImplicitTransparentDark =
          config.colorscheme === "" && config.mode === "dark";

        if (firstFullWidth && navbar && isTransparent) {
          navbar.classList.add("navbar-fw-first");
          // If we are in dark mode with empty colorscheme, force transparent-dark styling
          if (isImplicitTransparentDark)
            navbar.classList.add("transparent-dark");
          // Initial theme
          if (config.mode === "dark" || config.colorscheme === "transparent-dark") {
            navbar.classList.add("navbar-dark");
            navbar.classList.remove("navbar-light");
          } else {
            navbar.classList.add("navbar-light");
            navbar.classList.remove("navbar-dark");
          }

          const topHeight = firstFullWidth.parentElement.parentElement.clientHeight;

          const applyScrolledTheme = () => {
            if (config.mode === "dark") {
              navbar.classList.add("navbar-dark");
              navbar.classList.remove("navbar-light");
              // Keep transparent-dark class only if explicitly chosen; implicit variant can stay (harmless)
            } else {
              navbar.classList.add("navbar-light");
              navbar.classList.remove("navbar-dark");
            }
          };

          const onScroll = () => {
            const y = window.scrollY || window.pageYOffset;
            if (y >= topHeight) {
              navbar.classList.add("scrolled");
              applyScrolledTheme();
            } else {
              navbar.classList.remove("scrolled");
              // Revert to initial transparent intent
              if (config.mode === "dark" || config.colorscheme === "transparent-dark") {
                navbar.classList.add("navbar-dark");
                navbar.classList.remove("navbar-light");
                if (isImplicitTransparentDark)
                  navbar.classList.add("transparent-dark");
              } else {
                navbar.classList.add("navbar-light");
                navbar.classList.remove("navbar-dark");
              }
            }
          };
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else if (navbar && isTransparent) {
          // No full-width hero
          navbar.classList.add("navbar-fw-first", "scrolled");
            if (isImplicitTransparentDark)
              navbar.classList.add("transparent-dark");
          if (config.mode === "dark") {
            navbar.classList.add("navbar-dark");
            navbar.classList.remove("navbar-light");
          } else {
            navbar.classList.add("navbar-light");
            navbar.classList.remove("navbar-dark");
          }
        } else if (firstFullWidth && navbar && !isTransparent) {
          // Non-transparent navbar
          const sec = firstFullWidth.parentElement.parentElement;
          const navH = navbar.offsetHeight;
          if (!sec.style.marginTop) sec.style.marginTop = navH + "px";
        }

        if (!CSS.supports("selector(:has(*))")) {
          document.querySelectorAll("section.page-section.fw-check").forEach(sec => {
            const fw = sec.querySelector(":scope > .container > .full-page-width:first-child, :scope > .container-fluid > .full-page-width:first-child");
            if (fw && isTransparent && navbar) {
              if (!navbar.classList.contains("fixed-top")) {
                navbar.style.position = "absolute";
                navbar.style.top = "0";
                navbar.style.left = "0";
                navbar.style.right = "0";
              }
              navbar.classList.add("navbar-fw-first");
              navbar.style.background = "transparent";
              navbar.style.boxShadow = "none";
            } else if (fw && !isTransparent && navbar) {
              const navH = navbar.offsetHeight;
              const parentSec = fw.parentElement.parentElement;
              if (!parentSec.style.marginTop) parentSec.style.marginTop = navH + "px";
            }
          });
        }
      })();
    </script>
    <script type="text/javascript" src="/plugins/public/material-design${verstring}/js/mdb-jquery-bridge.js"></script>

    ${headersInBody(headers)}
    ${config.colorscheme === "navbar-light" ? navbarSolidOnScroll : ""}
  </body>
</html>`;
};

const header_sections = (brand, sections, currentUrl, config, user, title) => {
  if (!sections && !brand) return "";
  const { primary, secondary } = splitPrimarySecondaryMenu(sections || []);

  switch (config?.layout_style) {
    case "Vertical":
      return vertical_header_sections(
        brand,
        primary,
        secondary,
        currentUrl,
        config,
        user
      );

    default: //Horizontal
      return navbar(brand, sections, currentUrl, config);
  }
};

const vertical_sidebar_sections = (
  brand,
  primary,
  secondary,
  currentUrl,
  config,
  user
) =>
  (brand &&
    a(
      {
        href: "/",
        class: "d-flex p-3 align-items-center text-decoration-none fs-4",
      },
      brand.logo &&
        img({
          src: brand.logo,
          alt: "Logo",
          class: "me-2 object-fit-contain",
          width: "40",
          height: "32",
        }),
      (!config?.hide_site_name || !brand.logo) && brand.name
    )) +
  horizontalLineItem() +
  ul(
    {
      class: "nav w-100 flex-column flex-nowrap overflow-y-auto",
    },
    [...primary].map(sideBarSection(currentUrl, config, user))
  ) +
  horizontalLineItem(["mt-auto"]) +
  ul(
    { class: "nav w-100 flex-column flex-nowrap" },
    [...secondary].map(sideBarSection(currentUrl, config, user))
  );

const vertical_header_sections = (
  brand,
  primary,
  secondary,
  currentUrl,
  config,
  user
) =>
  aside(
    {
      class: [
        "sidenav sidenav-zIndex shadow position-fixed top-0 start-0 p-1 d-none d-lg-flex flex-column flex-shrink-0 bg-body-subtle border-end overflow-y-auto",
        config?.colorscheme && config.colorscheme.toLowerCase(),
      ],
      ...(config?.colorscheme.includes("sidenav-dark") && {
        "data-bs-theme": "dark",
      }),
      ...(config?.colorscheme.includes("sidenav-light") && {
        "data-bs-theme": "light",
      }),
    },
    vertical_sidebar_sections(
      brand,
      primary,
      secondary,
      currentUrl,
      config,
      user
    )
  ) +
  div(
    { class: ["offcanvas offcanvas-start"], tabindex: "-1", id: "sidebar" },
    aside(
      {
        class: [
          "sidenav offcanvas-body p-1 d-flex d-lg-none flex-column flex-shrink-0 bg-body-subtle border-end overflow-y-auto",
          config?.colorscheme && config.colorscheme.toLowerCase(),
        ],
        ...(config?.colorscheme.includes("sidenav-dark") && {
          "data-bs-theme": "dark",
        }),
        ...(config?.colorscheme.includes("sidenav-light") && {
          "data-bs-theme": "light",
        }),
      },
      vertical_sidebar_sections(
        brand,
        primary,
        secondary,
        currentUrl,
        config,
        user
      )
    )
  ) +
  header(
    {
      class: [
        "navbar navbar-expand-lg d-lg-none",
        config?.colorscheme && config.colorscheme.toLowerCase(),
      ],
      ...(config?.colorscheme.includes("sidenav-dark") && {
        "data-bs-theme": "dark",
      }),
      ...(config?.colorscheme.includes("sidenav-light") && {
        "data-bs-theme": "light",
      }),
    },
    div(
      { class: "container-xl" },
      button(
        {
          class: "navbar-toggler",
          type: "button",
          "data-bs-toggle": "offcanvas",
          "data-bs-target": "#sidebar",
        },
        span({ class: "navbar-toggler-icon" })
      ),
      brand && showBrand(brand, config),
      div(
        { class: "navbar-nav flex-row order-lg-last" },
        secondary.map(sideBarSection(currentUrl, config, user))
      )
    )
  );

const authBrand = (config, { name, logo }) =>
  logo
    ? `<img class="mb-4" src="${logo}" alt="Logo" width="72" height="72">`
    : "";

const layout = (config) => ({
  wrap: ({
    title,
    menu,
    brand,
    alerts,
    currentUrl,
    body,
    headers,
    role,
    req,
  }) =>
    wrapIt(
      config,
      'id="page-top"',
      headers,
      title,
      `
      <div id="wrapper">
      ${header_sections(brand, menu, currentUrl, config, req?.user, title)}
        <div class="${config.fluid ? "container-fluid" : "container-xl"}">
          <div class="row">
            <div class="col-sm-12" id="page-inner-content">
              ${renderBody(title, body, alerts, config, role)}
            </div>
          </div>
        </div>
    </div>
    `
    ),
  renderBody: ({ title, body, alerts, role }) =>
    renderBody(title, body, alerts, config, role),
  authWrap: ({
    title,
    alerts, //TODO
    form,
    afterForm,
    headers,
    brand,
    csrfToken,
    authLinks,
  }) =>
    wrapIt(
      config,
      'class="text-center"',
      headers,
      title,
      `
  <div class="form-signin">
    ${alerts.map((a) => alert(a.type, a.msg)).join("")}
    ${authBrand(config, brand)}
    <h3>
      ${title}
    </h3>
    ${renderForm(formModify(form), csrfToken)}
    ${renderAuthLinks(authLinks)}
    ${afterForm}
    <style>
    html,
body {
  height: 100%;
}

body {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  /* background-color: #f5f5f5; */
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: 0 auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
    </style>
  </div>
  `
    ),
});
const renderAuthLinks = (authLinks) => {
  var links = [];
  if (authLinks.login)
    links.push(link(authLinks.login, "Already have an account? Login!"));
  if (authLinks.forgot) links.push(link(authLinks.forgot, "Forgot password?"));
  if (authLinks.signup)
    links.push(link(authLinks.signup, "Create an account!"));
  const meth_links = (authLinks.methods || [])
    .map(({ url, icon, label }) =>
      a(
        { href: url, class: "btn btn-secondary btn-user btn-block mb-1" },
        icon || "",
        `&nbsp;Login with ${label}`
      )
    )
    .join("");

  return (
    meth_links + links.map((l) => div({ class: "text-center" }, l)).join("")
  );
};
const formModify = (form) => {
  form.formStyle = "vert";
  form.submitButtonClass = "btn-primary btn-user btn-block";
  return form;
};

const user_config_form = (ctx) => {
  return new Form({
    fields: [
      {
        name: "mode",
        label: "Mode",
        type: "String",
        required: true,
        default: ctx?.mode || "light",
        attributes: {
          options: [
            { name: "light", label: "Light" },
            { name: "dark", label: "Dark" },
            { name: "auto", label: "Auto" },
          ],
        },
      },
    ],
  });
};

const configuration_workflow = (config) =>
  new Workflow({
    onDone: (ctx) => {
      ctx.backgroundColorDark = "#424242";
      return ctx;
    },
    steps: [
      {
        name: "stylesheet",
        form: async () => {
          return new Form({
            fields: [
              {
                name: "in_card",
                label: "Default content in card?",
                type: "Bool",
                required: true,
              },
              {
                name: "colorscheme",
                label: "Sidebar color scheme",
                type: "String",
                required: true,
                default: "",
                attributes: {
                  options: [
                    { name: "", label: "Default" },
                    { name: "sidenav-dark bg-dark", label: "Dark" },
                    { name: "sidenav-dark bg-primary", label: "Dark Primary" },
                    {
                      name: "sidenav-dark bg-secondary",
                      label: "Dark Secondary",
                    },
                    { name: "sidenav-light bg-light", label: "Light" },
                    { name: "sidenav-light bg-white", label: "White" },
                    { name: "sidenav-light", label: "Transparent Light" },
                    {
                      name: "sidenav-light navbar-scrolling bg-light",
                      label: "Scrolling Light",
                    },
                    {
                      name: "sidenav-dark navbar-scrolled bg-dark",
                      label: "Scrolled Dark",
                    },
                  ],
                },
                showIf: { layout_style: "Vertical" },
              },
              {
                name: "colorscheme",
                label: "Navbar color scheme",
                type: "String",
                required: true,
                default: "",
                attributes: {
                  options: [
                    { name: "", label: "Default" },
                    { name: "navbar-dark bg-dark", label: "Dark" },
                    { name: "navbar-dark bg-primary", label: "Dark Primary" },
                    {
                      name: "navbar-dark bg-secondary",
                      label: "Dark Secondary",
                    },
                    { name: "navbar-light bg-light", label: "Light" },
                    { name: "navbar-light bg-white", label: "White" },
                    { name: "", label: "Transparent Light" },
                    { name: "transparent-dark", label: "Transparent Dark" },
                    {
                      name: "navbar-scrolling bg-light",
                      label: "Scrolling Light",
                    },
                    { name: "navbar-scrolled bg-dark", label: "Scrolled Dark" },
                  ],
                },
                showIf: { layout_style: "Horizontal" },
              },
              {
                name: "fixedTop",
                label: "Navbar Fixed Top",
                type: "Bool",
                required: true,
                showIf: { layout_style: "Horizontal" },
              },
              {
                name: "fluid",
                label: "Fluid",
                type: "Bool",
              },
              {
                name: "mode",
                label: "Mode",
                type: "String",
                required: true,
                default: "light",
                attributes: {
                  options: [
                    { name: "light", label: "Light" },
                    { name: "dark", label: "Dark" },
                    { name: "auto", label: "Auto" },
                  ],
                },
              },
              {
                name: "layout_style",
                label: "Layout style",
                type: "String",
                required: true,
                attributes: {
                  inline: true,
                  options: ["Horizontal", "Vertical"],
                },
              },
              {
                name: "toppad",
                label: "Top padding",
                sublabel: "0-5 depending on Navbar height and configuration",
                type: "Integer",
                required: true,
                default: 2,
                attributes: {
                  max: 5,
                  min: 0,
                },
              },
              // {
              //   name: "primary_color",
              //   label: "Primary Color",
              //   type: "Color",
              //   default: "#3b71ca",
              //   required: false,
              // },
              // {
              //   name: "secondary_color",
              //   label: "Secondary Color",
              //   type: "Color",
              //   default: "#9fa6b2",
              //   required: false,
              // },
              {
                name: "primary_color_light",
                label: "Primary Color (Light Mode)",
                type: "Color",
                default: "#3b71ca",
                required: false,
              },
              {
                name: "secondary_color_light",
                label: "Secondary Color (Light Mode)",
                type: "Color",
                default: "#9fa6b2",
                required: false,
              },
              {
                name: "primary_color_dark",
                label: "Primary Color (Dark Mode)",
                type: "Color",
                default: "#3b71ca",
                required: false,
              },
              {
                name: "secondary_color_dark",
                label: "Secondary Color (Dark Mode)",
                type: "Color",
                default: "#9fa6b2",
                required: false,
              },
            ],
          });
        },
      },
    ],
  });

module.exports = {
  sc_plugin_api_version: 1,
  layout,
  configuration_workflow,
  user_config_form,
  plugin_name: "material-design",
  actions: () => ({
    toggle_material_dark_mode: {
      description: "Switch between dark and light mode",
      configFields: [],
      run: async ({ user, req }) => {
        let plugin = await Plugin.findOne({ name: "material-design" });
        if (!plugin) {
          plugin = await Plugin.findOne({
            name: "@saltcorn/material-design",
          });
        }
        const dbUser = await User.findOne({ id: user.id });
        const attrs = dbUser._attributes || {};
        const userLayout = attrs.layout || {
          config: {},
        };
        userLayout.plugin = plugin.name;
        const currentMode = userLayout.config.mode
          ? userLayout.config.mode
          : plugin.configuration?.mode
          ? plugin.configuration.mode
          : "light";
        userLayout.config.mode = currentMode === "dark" ? "light" : "dark";
        userLayout.config.is_user_config = true;
        attrs.layout = userLayout;
        await dbUser.update({ _attributes: attrs });
        getState().processSend({
          refresh_plugin_cfg: plugin.name,
          tenant: db.getTenantSchema(),
        });
        getState().userLayouts[user.email] = layout({
          ...(plugin.configuration ? plugin.configuration : {}),
          ...userLayout.config,
        });
        await sleep(500);
        return { reload_page: true };
      },
    },
  }),
};
