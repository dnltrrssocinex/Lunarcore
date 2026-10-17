/* Lunarcore Studios - site configuration.
   Everything that changes per environment lives here. */
window.LUNARCORE = {
  /* GoHighLevel inbound webhook URL. Every survey answer and booking request
     is POSTed here as JSON (see js/forms.js for the payload shape).
     Leave empty while testing: requests then fall back to a mailto link. */
  webhook: '',

  /* Studio inbox used for the mailto fallback and the contact card. */
  email: 'hello@lunarcorestudios.com',

  /* Where "Add to calendar" places the shoot. */
  location: 'Lunarcore Studios, Philippines',

  /* Steps shown in the "What happens next" panel after any submission. */
  next: [
    ['When', 'Your request lands in our inbox', 'bolt'],
    ['Wait', 'Within the day', 'clock'],
    ['Then', 'We reply with a crew plan and a quote', 'mail'],
    ['And', 'Your date is locked in', 'check'],
  ],
};
