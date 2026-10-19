Build me a GoHighLevel workflow called "Website Lead Intake - Lunarcore Studios".

CONTEXT
Lunarcore Studios is a video, photo and event production studio in the Philippines (timezone Asia/Manila). Our website sends every lead to this workflow through an Inbound Webhook. There are two kinds of lead, told apart by the field "kind":
- kind = "survey": someone filled in "Start a project" (who they are, what services they need, timing).
- kind = "booking": someone held a date on our booking calendar for a shoot or event.

TRIGGER
Inbound Webhook (premium trigger). Use these two sample requests to map fields. Every value is reachable as {{inboundWebhookRequest.<field>}}. Some requests may arrive form-encoded instead of JSON; the field names are identical.

Sample survey request:
{
  "source": "lunarcore-site",
  "page": "/start",
  "submittedAt": "2026-10-19T01:10:15.742Z",
  "kind": "survey",
  "name": "Jun Reyes",
  "firstName": "Jun",
  "lastName": "Reyes",
  "email": "jun@example.com",
  "phone": "+63 918 555 0101",
  "company": "Kape Co",
  "role": "Event organiser",
  "goals": ["Event coverage", "Live stream"],
  "goalsText": "Event coverage, Live stream",
  "timing": "This month",
  "notes": "Product launch at SM, 300 pax.",
  "reference": "LC-EK50VY"
}

Sample booking request:
{
  "source": "lunarcore-site",
  "page": "/book",
  "submittedAt": "2026-10-19T01:10:10.791Z",
  "kind": "booking",
  "name": "Maria Santos Cruz",
  "firstName": "Maria",
  "lastName": "Santos Cruz",
  "email": "maria@example.com",
  "phone": "+63 917 123 4567",
  "company": "Brew Lab grand opening",
  "type": "Brand reels",
  "hours": 2,
  "slot": "2026-10-21T13:30:00+08:00",
  "slotLabel": "Wed, Oct 21, 1:30 PM",
  "notes": "Opening day, 150 guests, need highlights.",
  "reference": "LC-EK4WD0"
}

Possible values:
- role: Business owner, Marketing lead, Event organiser, Restaurant or cafe, Agency, Creator
- goals / goalsText: Event coverage, Reels and video ads, Product and food photos, Live stream, Social media management, Graphic design
- timing: This month, Next month, In 3 months or more, Not sure yet (can be empty)
- type: Event coverage, Brand reels, Product photos, Live stream
- slot is empty and slotLabel is "Flexible" when the person did not pick a time.
- phone, company and notes can be empty. The website does not collect a street address.

CUSTOM FIELDS (create these on the Contact first if they don't exist)
- Lead Type (single line): survey or booking
- Lead Reference (single line)
- Role (dropdown, values above)
- Services Wanted (multi-line text)
- Timing (dropdown, values above)
- Shoot Type (dropdown, values above)
- Crew Hours (number)
- Preferred Slot (date/time)
- Preferred Slot Label (single line)
- Project Notes (multi-line text)
- Lead Page (single line)

STEP 1 - CREATE OR UPDATE THE CONTACT
- Find an existing contact by email first, then by phone. If found, update it; never create a duplicate.
- First Name = firstName, Last Name = lastName, Email = email, Phone = phone (format as +63 when it starts with 09), Company Name = company.
- Lead Type = kind, Lead Reference = reference, Role = role, Services Wanted = goalsText, Timing = timing, Shoot Type = type, Crew Hours = hours, Preferred Slot = slot, Preferred Slot Label = slotLabel, Project Notes = notes, Lead Page = page.
- Contact Source = "Lunarcore Website".
- Never overwrite a field that already has a value with an empty value.
- Add tags: "website lead", plus "lead - survey" or "lead - booking" based on kind, plus one tag per service in goalsText or type (for example "svc - event coverage").

STEP 2 - CREATE OR UPDATE THE OPPORTUNITY
- Pipeline: "Lunarcore Sales". Create it if missing, with stages: New Lead, Contacted, Proposal Sent, Booked, Shoot Done, Lost.
- If this contact already has an open opportunity in this pipeline, update that one instead of creating another.
- Opportunity name: "{{company, or full name if company is empty}} - {{type, or goalsText for surveys}} ({{reference}})".
- Stage: New Lead. Status: Open. Source: Lunarcore Website. Leave monetary value empty.
- Assign to the contact owner if there is one; otherwise round-robin between the producers.

STEP 3 - BRANCH ON kind
Add an If/Else on {{inboundWebhookRequest.kind}}: "booking" goes to branch A, everything else to branch B. Each branch sends the emails below. Sender name "Lunarcore Studios", from and reply-to: hello@lunarcorestudios.com.

STEP 4 - EMAIL TO THE CONTACT (acknowledgement)
Send immediately. Warm, short, plain language, no hype, signed "The Lunarcore team".

Branch A (booking):
Subject: Your {{type}} slot is held - {{reference}}
Body:
Hi {{first name}},
Thanks for booking with Lunarcore Studios. We've held this for you:
- Shoot: {{type}} ({{hours}} hours)
- When: {{slotLabel}}
- For: {{company}}
- Reference: {{reference}}
Holding a slot is free and nothing is charged until you approve the quote. A producer will reply within the day with a crew plan and a quote, then we lock in your date.
Questions? Just reply to this email.

Branch B (survey):
Subject: We got your brief - {{reference}}
Body:
Hi {{first name}},
Thanks for telling us about {{company}}. Here's what we have:
- You are: {{role}}
- Looking for: {{goalsText}}
- Timing: {{timing}}
- Reference: {{reference}}
A producer will reply within the day with a crew plan and a quote. If you already have a date, you can hold it here: https://dnltrrssocinex.github.io/Lunarcore/book.html
Questions? Just reply to this email.

If phone is not empty, also send this SMS:
"Hi {{first name}}, Lunarcore Studios here. We got your {{type or 'brief'}} request ({{reference}}). A producer will reach out within the day."

STEP 5 - TEAM NOTIFICATIONS
a) Internal notification (in-app and email) to the assigned user.
b) Email to the team inboxes: hello@lunarcorestudios.com, plus any other producer addresses I add later.
Subject: New {{kind}} lead: {{full name}} - {{type or goalsText}} ({{reference}})
Body: every field from the request in a simple list: Name, Email, Phone, Company or event, Lead type, Role, Services wanted, Timing, Shoot type, Crew hours, Preferred slot (slotLabel), Notes, Page, Submitted at (convert to Asia/Manila), Reference, plus a direct link to the contact and to the opportunity in GHL.
Start the body with: "Reply within the day. Booking leads with a slot this week come first."

STEP 6 - FOLLOW-UP TASK
Create a task for the assigned user: "Reply to {{full name}} - {{reference}}", due in 4 business hours (Asia/Manila, Mon to Sat 9:00 to 18:00). For booking leads whose slot is within the next 3 days, mark the task high priority and due in 1 hour.

RULES
- One run per webhook request; stop the workflow if both email and phone are empty.
- Allow re-entry, so returning leads create new notifications and update the same opportunity.
- Use Asia/Manila time for every date and time shown to people.
- When done, list the custom fields, pipeline and stages you created, and every action in order, so I can review before publishing.
