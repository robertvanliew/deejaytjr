/**
 * Friction against casual image saving.
 *
 * Requested by the client, and worth stating plainly in the place someone will
 * read it: this is a speed bump, not protection. The file still travels to the
 * browser, so it remains reachable through devtools, the network panel, a
 * screenshot, or with JavaScript switched off. Nothing rendered in a browser
 * can be withheld from the person viewing it.
 *
 * What it does do is stop the reflex right-click → Save image as, which is how
 * almost every unlicensed copy of a photograph actually starts. The real
 * controls are editorial rather than technical, and are already in place: the
 * site publishes web-sized renditions, and the print originals stay with her
 * team (see ASSETS-NEEDED.md).
 */
export function protectImages() {
  document.addEventListener('contextmenu', (e) => {
    const t = e.target as HTMLElement | null;
    /* Only her photography. Right-click stays available everywhere else, so
       copying an email address or opening a link in a new tab still works. */
    if (t?.closest('img, picture, .vbox-stage')) e.preventDefault();
  });

  /* Dragging an image to the desktop saves it just as effectively as the
     context menu, and is not covered by the listener above. */
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement | null)?.closest('img, picture')) e.preventDefault();
  });
}
