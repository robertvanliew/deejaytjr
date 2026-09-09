# Testimonials

Empty on purpose.

Section 11, item 4 of the developer brief makes testimonials a launch blocker:
three quotes with name, title, company and **written permission**. None have
been supplied, and we do not write them on the client's behalf.

Add one JSON file per quote:

```json
{
  "quote": "...",
  "name": "...",
  "role": "Director of Events",
  "company": "...",
  "permissionOnFile": true,
  "services": ["corporate"]
}
```

`permissionOnFile` must be `true` for the quote to render. The build will not
publish a quote without it.
