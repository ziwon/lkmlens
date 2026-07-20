import { describe, expect, it } from "vitest";
import { extractFilePaths } from "./diff.js";

describe("extractFilePaths", () => {
  it("extracts a single file path from a real diff --git header", () => {
    // Condensed from a real bpf-next patch (kernel/bpf/stream.c).
    const body = `
bpf: roll back stream capacity when allocation fails

Signed-off-by: Someone <someone@example.com>
---
 kernel/bpf/stream.c | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

diff --git a/kernel/bpf/stream.c b/kernel/bpf/stream.c
index 1234567..89abcde 100644
--- a/kernel/bpf/stream.c
+++ b/kernel/bpf/stream.c
@@ -1,3 +1,3 @@
-old line
+new line
`;
    expect(extractFilePaths(body)).toEqual(["kernel/bpf/stream.c"]);
  });

  it("extracts multiple file paths across a multi-file diff", () => {
    const body = `
diff --git a/drivers/gpu/drm/panel/panel-edp.c b/drivers/gpu/drm/panel/panel-edp.c
index 111..222 100644
--- a/drivers/gpu/drm/panel/panel-edp.c
+++ b/drivers/gpu/drm/panel/panel-edp.c
@@ -1 +1 @@
-a
+b
diff --git a/Documentation/devicetree/bindings/display/amlogic,meson-dw-hdmi.yaml b/Documentation/devicetree/bindings/display/amlogic,meson-dw-hdmi.yaml
index 333..444 100644
--- a/Documentation/devicetree/bindings/display/amlogic,meson-dw-hdmi.yaml
+++ b/Documentation/devicetree/bindings/display/amlogic,meson-dw-hdmi.yaml
@@ -1 +1 @@
-a
+b
`;
    expect(extractFilePaths(body).sort()).toEqual(
      [
        "Documentation/devicetree/bindings/display/amlogic,meson-dw-hdmi.yaml",
        "drivers/gpu/drm/panel/panel-edp.c",
      ].sort(),
    );
  });

  it("handles a new file (a/ side is /dev/null)", () => {
    const body = `
diff --git a/dev/null b/drivers/remoteproc/qcom_new_driver.c
new file mode 100644
index 000000..111111
--- /dev/null
+++ b/drivers/remoteproc/qcom_new_driver.c
@@ -0,0 +1 @@
+new content
`;
    expect(extractFilePaths(body)).toEqual(["drivers/remoteproc/qcom_new_driver.c"]);
  });

  it("returns an empty array for a plain-text reply with no diff", () => {
    const body = "Looks good to me.\n\n> some quoted text\n> more quoting\n";
    expect(extractFilePaths(body)).toEqual([]);
  });

  it("falls back to diffstat lines when there's no full diff", () => {
    const body = `
Here's the plan for the series:

 drivers/remoteproc/qcom_q6v5_pas.c | 12 ++++++++----
 drivers/remoteproc/qcom_common.c   |  4 ++--
 2 files changed, 10 insertions(+), 6 deletions(-)
`;
    expect(extractFilePaths(body).sort()).toEqual(
      ["drivers/remoteproc/qcom_common.c", "drivers/remoteproc/qcom_q6v5_pas.c"].sort(),
    );
  });
});
