import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import path from "node:path";

/**
 * Compact QA reporter.
 * Output per test: scenario | PASS / FAIL / BLOCKED | failed step | URL | artifacts
 */
class CompactReporter implements Reporter {
  private results: {
    scenario: string;
    status: "PASS" | "FAIL" | "BLOCKED";
    failedStep?: string;
    url?: string;
    artifacts: string[];
  }[] = [];

  onBegin(_config: FullConfig, _suite: Suite) {
    console.log("\n" + "=".repeat(70));
    console.log("QA RUN — " + new Date().toISOString());
    console.log("=".repeat(70));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const scenario = test.parent.title || test.title;

    let status: "PASS" | "FAIL" | "BLOCKED";
    if (result.status === "passed") {
      status = "PASS";
    } else if (result.status === "skipped" || result.status === "interrupted") {
      status = "BLOCKED";
    } else {
      status = "FAIL";
    }

    // Extract failed step from error
    let failedStep: string | undefined;
    if (result.errors.length > 0) {
      const msg = result.errors[0]?.message ?? "";
      // Take first line, trim to 120 chars
      failedStep = msg.split("\n")[0]?.slice(0, 120);
    }

    // Collect artifact paths
    const artifacts: string[] = [];
    for (const att of result.attachments) {
      if (att.path) {
        artifacts.push(path.basename(att.path));
      }
    }

    // Try to extract URL from error or step info (best effort)
    let url: string | undefined;
    if (result.errors.length > 0) {
      const full = result.errors.map((e) => e.message ?? "").join(" ");
      const urlMatch = full.match(/https?:\/\/[^\s"')]+/);
      if (urlMatch) url = urlMatch[0];
    }

    this.results.push({ scenario, status, failedStep, url, artifacts });

    // Print immediately
    const line = [
      status.padEnd(7),
      scenario,
      failedStep ? `| step: ${failedStep}` : "",
      url ? `| url: ${url}` : "",
      artifacts.length > 0 ? `| artifacts: ${artifacts.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(line);
  }

  onEnd(_result: FullResult) {
    console.log("=".repeat(70));
    const passed = this.results.filter((r) => r.status === "PASS").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;
    const blocked = this.results.filter((r) => r.status === "BLOCKED").length;
    console.log(`Total: ${this.results.length} | PASS: ${passed} | FAIL: ${failed} | BLOCKED: ${blocked}`);
    console.log("=".repeat(70) + "\n");
  }
}

export default CompactReporter;
