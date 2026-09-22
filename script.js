/* =========================================================
   Dados e configurações
   ========================================================= */

const STORAGE_KEY = "planner-mensal-eventos";
const MIN_YEAR = 2026;
const MAX_YEAR = 2030;

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const weekdayNames = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

let selectedDate = new Date();
let displayedYear = selectedDate.getFullYear();
let displayedMonth = selectedDate.getMonth();
let events = loadEvents();

/* Mantém o planner dentro do intervalo permitido. */
if (displayedYear < MIN_YEAR || displayedYear > MAX_YEAR) {
  displayedYear = MIN_YEAR;
  displayedMonth = 0;
}

/* =========================================================
   Elementos da interface
   ========================================================= */

const calendarGrid = document.getElementById("calendarGrid");
const currentMonthElement = document.getElementById("currentMonth");
const currentYearElement = document.getElementById("currentYear");
const monthEventsList = document.getElementById("monthEventsList");

const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");
const modalTitle = document.getElementById("modalTitle");
const formError = document.getElementById("formError");

const eventIdInput = document.getElementById("eventId");
const eventTitleInput = document.getElementById("eventTitle");
const eventStartInput = document.getElementById("eventStart");
const eventEndInput = document.getElementById("eventEnd");
const eventIconInput = document.getElementById("eventIcon");
const eventColorInput = document.getElementById("eventColor");
const deleteEventButton = document.getElementById("deleteEventButton");

/* =========================================================
   Inicialização
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  updateTodayPanel();
  renderCalendar();
  renderMonthSummary();
  setupEvents();
});

/* =========================================================
   Eventos da interface
   ========================================================= */

function setupEvents() {
  document.getElementById("previousMonth").addEventListener("click", () => {
    changeMonth(-1);
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    changeMonth(1);
  });

  document.getElementById("previousYear").addEventListener("click", () => {
    changeYear(-1);
  });

  document.getElementById("nextYear").addEventListener("click", () => {
    changeYear(1);
  });

  document.getElementById("goToToday").addEventListener("click", goToToday);

  document
    .getElementById("openCreateButton")
    .addEventListener("click", () => openEventModal());

  document
    .getElementById("closeModal")
    .addEventListener("click", closeEventModal);

  document
    .getElementById("cancelModal")
    .addEventListener("click", closeEventModal);

  document
    .getElementById("deleteEventButton")
    .addEventListener("click", deleteCurrentEvent);

  eventForm.addEventListener("submit", saveEvent);

  eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) {
      closeEventModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeEventModal();
    }
  });
}

/* =========================================================
   Funções relacionadas ao calendário
   ========================================================= */

function renderCalendar() {
  calendarGrid.innerHTML = "";

  currentMonthElement.textContent = monthNames[displayedMonth];
  currentYearElement.textContent = displayedYear;

  const firstDay = new Date(displayedYear, displayedMonth, 1);
  const firstWeekday = firstDay.getDay();

  const daysInCurrentMonth = new Date(
    displayedYear,
    displayedMonth + 1,
    0
  ).getDate();

  const daysInPreviousMonth = new Date(
    displayedYear,
    displayedMonth,
    0
  ).getDate();

  /*
   * Serão exibidas 42 células para manter uma grade mensal estável,
   * incluindo dias do mês anterior e do próximo mês.
   */
  for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
    let date;
    let isOutsideMonth = false;

    if (cellIndex < firstWeekday) {
      const day = daysInPreviousMonth - firstWeekday + cellIndex + 1;
      date = new Date(displayedYear, displayedMonth - 1, day);
      isOutsideMonth = true;
    } else if (cellIndex >= firstWeekday + daysInCurrentMonth) {
      const day =
        cellIndex - firstWeekday - daysInCurrentMonth + 1;
      date = new Date(displayedYear, displayedMonth + 1, day);
      isOutsideMonth = true;
    } else {
      const day = cellIndex - firstWeekday + 1;
      date = new Date(displayedYear, displayedMonth, day);
    }

    const cell = createDayCell(date, isOutsideMonth);
    calendarGrid.appendChild(cell);
  }
}

function createDayCell(date, isOutsideMonth) {
  const cell = document.createElement("div");
  cell.className = "day-cell";

  if (isOutsideMonth) {
    cell.classList.add("outside-month");
  }

  if (isToday(date)) {
    cell.classList.add("today");
  }

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = String(date.getDate()).padStart(2, "0");

  const eventList = document.createElement("div");
  eventList.className = "event-list";

  const dateString = formatDateForInput(date);

  const eventsForDay = events
    .filter((event) => dateString >= event.start && dateString <= event.end)
    .sort((a, b) => a.start.localeCompare(b.start));

  const visibleEvents = eventsForDay.slice(0, 3);

  visibleEvents.forEach((event) => {
    const eventTag = document.createElement("button");
    eventTag.type = "button";
    eventTag.className = "event-tag";
    eventTag.title = `${event.icon} ${event.title}\n${formatDateBR(event.start)} até ${formatDateBR(event.end)}`;
    eventTag.style.setProperty("--tag-color", event.color);

    if (dateString === event.start) {
      eventTag.classList.add("event-start");
    }

    if (dateString === event.end) {
      eventTag.classList.add("event-end");
    }

    if (dateString !== event.start && dateString !== event.end) {
      eventTag.classList.add("event-middle");
    }

    eventTag.textContent =
      dateString === event.start
        ? `${event.icon} ${event.title}`
        : "•";

    eventTag.addEventListener("click", (clickEvent) => {
      clickEvent.stopPropagation();
      openEventModal(event);
    });

    eventList.appendChild(eventTag);
  });

  if (eventsForDay.length > visibleEvents.length) {
    const more = document.createElement("span");
    more.className = "more-events";
    more.textContent = `+ ${eventsForDay.length - visibleEvents.length} evento(s)`;
    eventList.appendChild(more);
  }

  cell.appendChild(number);
  cell.appendChild(eventList);

  cell.addEventListener("dblclick", () => {
    openEventModal(null, dateString);
  });

  return cell;
}

function changeMonth(amount) {
  let newMonth = displayedMonth + amount;
  let newYear = displayedYear;

  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  }

  if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }

  if (newYear < MIN_YEAR || newYear > MAX_YEAR) {
    return;
  }

  displayedMonth = newMonth;
  displayedYear = newYear;

  renderCalendar();
  renderMonthSummary();
}

function changeYear(amount) {
  const newYear = displayedYear + amount;

  if (newYear < MIN_YEAR || newYear > MAX_YEAR) {
    return;
  }

  displayedYear = newYear;
  renderCalendar();
  renderMonthSummary();
}

function goToToday() {
  const today = new Date();

  if (
    today.getFullYear() < MIN_YEAR ||
    today.getFullYear() > MAX_YEAR
  ) {
    return;
  }

  displayedYear = today.getFullYear();
  displayedMonth = today.getMonth();

  renderCalendar();
  renderMonthSummary();
  updateTodayPanel();
}

function isToday(date) {
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/* =========================================================
   Funções relacionadas às tags/eventos
   ========================================================= */

function openEventModal(event = null, suggestedDate = "") {
  eventModal.classList.remove("hidden");
  formError.textContent = "";

  if (event) {
    modalTitle.textContent = "Editar evento";
    eventIdInput.value = event.id;
    eventTitleInput.value = event.title;
    eventStartInput.value = event.start;
    eventEndInput.value = event.end;
    eventIconInput.value = event.icon;
    eventColorInput.value = event.color;
    deleteEventButton.classList.remove("hidden");
  } else {
    modalTitle.textContent = "Adicionar evento";
    eventForm.reset();
    eventIdInput.value = "";
    eventStartInput.value = suggestedDate || formatDateForInput(new Date());
    eventEndInput.value = suggestedDate || formatDateForInput(new Date());
    eventIconInput.value = "📚";
    eventColorInput.value = "#8b5cf6";
    deleteEventButton.classList.add("hidden");
  }

  eventTitleInput.focus();
}

function closeEventModal() {
  eventModal.classList.add("hidden");
  eventForm.reset();
  formError.textContent = "";
}

function saveEvent(event) {
  event.preventDefault();

  const title = eventTitleInput.value.trim();
  const start = eventStartInput.value;
  const end = eventEndInput.value;

  if (!title || !start || !end) {
    formError.textContent = "Preencha todos os campos obrigatórios.";
    return;
  }

  if (end < start) {
    formError.textContent =
      "A data final deve ser igual ou posterior à data inicial.";
    return;
  }

  const eventData = {
    id: eventIdInput.value || createId(),
    title,
    start,
    end,
    icon: eventIconInput.value,
    color: eventColorInput.value
  };

  const existingIndex = events.findIndex(
    (item) => item.id === eventData.id
  );

  if (existingIndex >= 0) {
    events[existingIndex] = eventData;
  } else {
    events.push(eventData);
  }

  saveEvents();
  closeEventModal();
  renderCalendar();
  renderMonthSummary();
}

function deleteCurrentEvent() {
  const eventId = eventIdInput.value;

  if (!eventId) {
    return;
  }

  const confirmed = window.confirm(
    "Deseja realmente excluir este evento?"
  );

  if (!confirmed) {
    return;
  }

  events = events.filter((event) => event.id !== eventId);
  saveEvents();
  closeEventModal();
  renderCalendar();
  renderMonthSummary();
}

function renderMonthSummary() {
  monthEventsList.innerHTML = "";

  const monthPrefix =
    `${displayedYear}-${String(displayedMonth + 1).padStart(2, "0")}`;

  const currentMonthEvents = events
    .filter(
      (event) =>
        event.start.startsWith(monthPrefix) ||
        event.end.startsWith(monthPrefix) ||
        (event.start < `${monthPrefix}-01` &&
          event.end >= `${monthPrefix}-01`)
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  if (!currentMonthEvents.length) {
    const empty = document.createElement("li");
    empty.className = "empty-summary";
    empty.textContent = "Nenhum evento cadastrado";
    monthEventsList.appendChild(empty);
    return;
  }

  currentMonthEvents.slice(0, 6).forEach((event) => {
    const item = document.createElement("li");
    item.textContent = `${event.icon} ${event.title}`;
    item.title = `${formatDateBR(event.start)} até ${formatDateBR(event.end)}`;
    monthEventsList.appendChild(item);
  });
}

/* =========================================================
   Funções de armazenamento
   ========================================================= */

function loadEvents() {
  try {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch (error) {
    console.error("Não foi possível carregar os eventos.", error);
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/* =========================================================
   Funções auxiliares
   ========================================================= */

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateBR(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function updateTodayPanel() {
  const today = new Date();

  document.getElementById("todayNumber").textContent =
    String(today.getDate()).padStart(2, "0");

  document.getElementById("todayWeekday").textContent =
    weekdayNames[today.getDay()];
}