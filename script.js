const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const modals = document.querySelectorAll(".modal");
const productModal = document.getElementById("product-modal");

const productDetails = {
  tomato: {
    label: "Tomato seed production",
    title: "Tomato Seeds",
    image: "assets/product-tomato.png",
    alt: "Tomato plants under planned seed production",
    summary: {
      crop: "Tomato",
      category: "Hybrid / OP by requirement",
      availability: "On request",
      moq: "Discuss by program",
      export: "Available"
    },
    text: "Tomato seed programs require careful crop planning, healthy plant growth, flowering-stage observation, and attention to fruit maturity before seed extraction and handling.",
    points: [
      "Production Uniformity: planned according to variety, acreage, quantity, and growing window.",
      "Field Monitoring Support: crop health, flowering, fruit setting, and production uniformity are followed.",
      "Export Documentation Available: buyer requirements can include quality checks, packing, and shipment coordination."
    ]
  },
  chilli: {
    label: "Chilli and hot pepper production",
    title: "Chilli Seeds",
    image: "assets/product-chilli.png",
    alt: "Chilli plants growing in organized field rows",
    summary: {
      crop: "Chilli / Hot Pepper",
      category: "Hybrid / OP by requirement",
      availability: "On request",
      moq: "Discuss by program",
      export: "Available"
    },
    text: "Chilli and hot pepper seed production depends on suitable field selection, crop-stage monitoring, plant health, fruit maturity, and careful post-harvest handling.",
    points: [
      "Production Uniformity: programs can be planned for chilli, hot pepper, or buyer-specified pepper requirements.",
      "Field Monitoring Support: cultivation planning considers season, isolation, crop care, and timeline.",
      "Export Documentation Available: seed preparation can be aligned with quality, packing, and shipment expectations."
    ]
  },
  "bell-pepper": {
    label: "Bell pepper and capsicum production",
    title: "Bell Pepper Seeds",
    image: "assets/product-bell-pepper.png",
    alt: "Bell pepper plants in protected cultivation",
    summary: {
      crop: "Bell Pepper / Capsicum",
      category: "Hybrid / OP by requirement",
      availability: "On request",
      moq: "Discuss by program",
      export: "Available"
    },
    text: "Bell pepper seed programs need close attention to plant vigor, flowering, fruit development, crop protection, and harvest timing for dependable seed output.",
    points: [
      "Production Uniformity: suitable for capsicum and sweet pepper requirements after feasibility review.",
      "Field Monitoring Support: discussions can cover protected cultivation, field planning, and quality expectations.",
      "Export Documentation Available: crop updates, seed handling, and export preparation can be coordinated."
    ]
  },
  custom: {
    label: "Requirement-based crop planning",
    title: "Buyer-Specified Crops",
    image: "assets/product-custom.png",
    alt: "Organized vegetable seed production field with crop rows",
    summary: {
      crop: "Buyer-Specified",
      category: "Custom program",
      availability: "Feasibility review",
      moq: "Discuss by crop",
      export: "Available"
    },
    text: "For buyer-specified crops, the program begins with requirement discussion. Crop feasibility, season, quantity, quality expectation, and destination market are reviewed before commitment.",
    points: [
      "Production Uniformity: useful for OP or hybrid vegetable seed production possibilities.",
      "Field Monitoring Support: planning can include crop selection, farmer network, isolation needs, and timeline.",
      "Export Documentation Available: the goal is a clear trial or contract program from planning to dispatch."
    ]
  }
};

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 40);
}

function openModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const focusTarget = modal.querySelector("input, button, textarea, a");
  if (focusTarget) focusTarget.focus();
}

function closeModals() {
  modals.forEach((modal) => {
    modal.hidden = true;
  });
  document.body.style.overflow = "";
}

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.classList.toggle("active", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

document.querySelectorAll("[data-close-modal]").forEach((trigger) => {
  trigger.addEventListener("click", closeModals);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModals();
  }
});

document.querySelectorAll("[data-product]").forEach((card) => {
  card.addEventListener("click", () => {
    const detail = productDetails[card.dataset.product];
    if (!detail || !productModal) return;

    productModal.querySelector("#product-modal-label").textContent = detail.label;
    productModal.querySelector("#product-modal-title").textContent = detail.title;
    productModal.querySelector("#product-modal-text").textContent = detail.text;
    productModal.querySelector("#product-summary-crop").textContent = detail.summary.crop;
    productModal.querySelector("#product-summary-category").textContent = detail.summary.category;
    productModal.querySelector("#product-summary-availability").textContent = detail.summary.availability;
    productModal.querySelector("#product-summary-moq").textContent = detail.summary.moq;
    productModal.querySelector("#product-summary-export").textContent = detail.summary.export;

    const image = productModal.querySelector("#product-modal-image");
    image.src = detail.image;
    image.alt = detail.alt;

    const list = productModal.querySelector("#product-modal-points");
    list.innerHTML = "";
    detail.points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });

    openModal(productModal);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();

function getFormValue(formData, key) {
  const value = formData.get(key);
  return value && String(value).trim() ? String(value).trim() : "Not provided";
}

function buildWhatsAppMessage(formData) {
  return [
    "New seed enquiry - Boosnur Genetics website",
    "",
    `Name: ${getFormValue(formData, "name")}`,
    `Company: ${getFormValue(formData, "company")}`,
    `Country: ${getFormValue(formData, "country")}`,
    `Phone / WhatsApp: ${getFormValue(formData, "phone")}`,
    `Email: ${getFormValue(formData, "email")}`,
    `Seed requirement: ${getFormValue(formData, "requirement")}`,
    `Quantity required: ${getFormValue(formData, "quantity")}`,
    `Message: ${getFormValue(formData, "message")}`,
    "",
    "Source: Boosnur Genetics website",
    "Company location: Davangere, Karnataka, India"
  ].join("\n");
}

document.querySelectorAll(".whatsapp-enquiry-form").forEach((form) => {
  const formStatus = form.querySelector(".form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const whatsappNumber = form.dataset.whatsappNumber || "918892757959";
    const message = buildWhatsAppMessage(formData);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    submitButton.disabled = true;
    submitButton.innerHTML = "Opening WhatsApp... <span>&rarr;</span>";
    formStatus.classList.remove("visible");
    formStatus.classList.remove("success");

    const openedWindow = window.open(whatsappUrl, "_blank", "noopener");
    if (!openedWindow) {
      window.location.href = whatsappUrl;
    }

    formStatus.textContent = "WhatsApp has opened with your enquiry. Please tap Send in WhatsApp to complete it.";
    formStatus.classList.add("visible", "success");

    window.setTimeout(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = "Send Enquiry <span>&rarr;</span>";
    }, 900);
  });
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
