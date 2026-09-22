document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    editable: true,
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next'
    },
    events: [
      { title: 'Barber', description: 'Lorem ipsum dolor sit amet.', start: '2025-05-05', end: '2025-05-05', extendedProps: { icon: 'circle' } },
      { title: 'Flight Paris', description: 'Lorem ipsum dolor sit amet.', start: '2025-08-08T14:00:00', end: '2025-08-08T20:00:00', allDay: false, extendedProps: { icon: 'cog' } },
      { title: 'Team Meeting', description: 'Lorem ipsum dolor sit amet.', start: '2025-07-10T13:00:00', end: '2025-07-10T16:00:00', allDay: false, extendedProps: { icon: 'group' } },
      { title: 'Meeting', description: 'Lorem ipsum dolor sit amet.', start: '2025-08-12', extendedProps: { icon: 'suitcase' } },
      { title: 'Conference', description: 'Lorem ipsum dolor sit amet.', start: '2025-08-13', end: '2025-08-15', extendedProps: { icon: 'calendar' } },
      { title: 'Baby Shower', description: 'Lorem ipsum dolor sit amet.', start: '2025-08-13', end: '2025-08-14', extendedProps: { icon: 'child' } },
      { title: 'Birthday', description: 'Lorem ipsum dolor sit amet.', start: '2025-09-13', end: '2025-09-14', extendedProps: { icon: 'birthday-cake' } },
      { title: 'Restaurant', description: 'Lorem ipsum dolor sit amet.', start: '2025-10-15T09:30:00', end: '2025-10-15T11:45:00', allDay: false, extendedProps: { icon: 'glass' } },
      { title: 'Dinner', description: 'Lorem ipsum dolor sit amet.', start: '2025-11-15T20:00:00', end: '2025-11-15T22:30:00', allDay: false, extendedProps: { icon: 'cutlery' } },
      { title: 'Shooting', description: 'Lorem ipsum dolor sit amet.', start: '2025-08-25', end: '2025-08-25', extendedProps: { icon: 'camera' } },
      { title: 'Go Space :)', description: 'Lorem ipsum dolor sit amet.', start: '2025-12-27', end: '2025-12-27', extendedProps: { icon: 'rocket' } },
      { title: 'Dentist', description: 'Lorem ipsum dolor sit amet.', start: '2025-12-29T11:30:00', end: '2025-12-29T12:30:00', allDay: false, extendedProps: { icon: 'medkit' } }
    ],
    eventDidMount: function (info) {
      const icon = info.event.extendedProps.icon;
      if (!icon) return;

      const titleEl = info.el.querySelector('.fc-event-title');
      if (!titleEl) return;

      const iconEl = document.createElement('i');
      iconEl.className = `fa fa-${icon}`;
      titleEl.prepend(iconEl);
    },
    dateClick: function (info) {
      document.querySelector('.event-icon').innerHTML = '<i class="fa fa-calendar"></i>';
      document.querySelector('.event-title').textContent = 'Novo evento';
      document.querySelector('.event-body').textContent = `Data selecionada: ${info.dateStr}`;
      $('#modal-view-event').modal('show');
    },
    eventClick: function (info) {
      const icon = info.event.extendedProps.icon || 'calendar';
      document.querySelector('.event-icon').innerHTML = `<i class="fa fa-${icon}"></i>`;
      document.querySelector('.event-title').textContent = info.event.title;
      document.querySelector('.event-body').textContent = info.event.extendedProps.description || info.event.title;
      $('#modal-view-event').modal('show');
    }
  });

  calendar.render();
});