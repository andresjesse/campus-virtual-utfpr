// A page's blocks live in three collections, so `position` is one sequence
// shared by all of them. A new block goes to the end of that sequence.
//
// A number field can't tell "not sent" from an explicit 0, so a 0 on a page that
// already has blocks is treated as "not set". The frontend only writes
// `position` on update, where this hook doesn't run.
//
// Everything lives inside the handler on purpose: PocketBase runs each hook in
// its own context, where file-scope helpers are not visible.
function appendBlockAtEnd(event) {
  const block = event.record;

  if (block.getInt("position") !== 0) return event.next();

  const page = block.getString("page");
  let last = -1;

  for (const name of ["rtf_block", "file_block", "diagram_block"]) {
    const [highest] = event.app.findRecordsByFilter(
      name,
      "page = {:page}",
      "-position",
      1,
      0,
      { page },
    );

    if (highest) last = Math.max(last, highest.getInt("position"));
  }

  block.set("position", last + 1);

  event.next();
}

onRecordCreate(appendBlockAtEnd, "rtf_block", "file_block", "diagram_block");
