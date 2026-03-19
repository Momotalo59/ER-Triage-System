# **App Name**: Crisis Triage Dashboard

## Core Features:

- Real-time Patient Monitoring: Display a comprehensive list of patients with their triage status, diagnosis, and current destination, updated dynamically.
- Dynamic Status Overviews: Summarize critical data in overview cards showing patient counts based on criticality (Critical, Urgent, Minor, Deceased).
- Resource and Status Breakdown Widgets: Provide detailed widgets for patient statuses (e.g., X-Ray, Admit), ED triage distribution, available blood inventory, and ventilator usage.
- Patient Data Management: Allow medical personnel to add new patient records and edit existing ones, including triage status, diagnosis, and destination updates.
- Centralized Data Persistence: Store and retrieve all application data, including patient information, status, and inventory, using a robust cloud database, implicitly from Project ID 'er-triage-system'.
- AI-powered Triage Suggestion Tool: Utilize an AI tool to provide preliminary triage level suggestions or diagnostic paths based on initial reported patient symptoms, assisting medical staff.

## Style Guidelines:

- Primary color: A deep, commanding red (#CC1140), conveying urgency and criticality while ensuring high visibility against dark backgrounds. Inspired by the app's focus on critical patient states.
- Background color: A very dark, desaturated red-grey (#1F1A1B), providing a sophisticated and low-glare backdrop suitable for prolonged monitoring in a clinical environment. This dark scheme highlights important data points effectively.
- Accent color: A vibrant pink-magenta (#EE61C2), strategically used for calls to action, active states, or highlighting critical alerts that demand immediate attention, creating clear contrast with the primary and background colors.
- Headline and Body font: 'Inter' (sans-serif), chosen for its exceptional clarity, neutrality, and readability across varying information densities, making it ideal for a data-intensive dashboard.
- Icons should be clear, simple, and functional system-style pictograms. Utilize distinct, easily recognizable icons for actions like editing, deleting, and adding, as well as for displaying specific medical resources.
- Implement a hierarchical and grid-based layout for optimal information density and ease of scanning. Key performance indicators (KPIs) and summaries are displayed prominently at the top, followed by a detailed, sortable patient list, and supporting information widgets at the bottom.
- Subtle and purposeful animations should be used for data updates (e.g., a brief flash or pulse on changed metrics), hover states, and transitions between data views to enhance user feedback without being distracting in a high-stakes environment.