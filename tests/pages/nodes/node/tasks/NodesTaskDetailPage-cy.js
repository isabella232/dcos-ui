describe("Nodes Task Detail Page", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-service-with-executor-task",
      nodeHealth: true,
    });
  });

  context("Navigate to node task detail page", () => {
    it("navigates to node task detail page", () => {
      cy.visitUrl({ url: "/nodes", identify: true });
      cy.get("a.table-cell-link-primary").eq(0).click({ force: true });
      cy.get("a.table-cell-link-secondary").eq(0).click();
      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+\/tasks\/[a-zA-Z0-9-]+/);

      cy.get("h1.configuration-map-heading").contains("Configuration");
    });
  });
});
