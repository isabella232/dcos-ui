describe("Installed Packages Tab", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true,
    }).visitUrl({ url: "/settings/repositories" });
  });

  it("displays a table of repositories", () => {
    cy.get("table.table > tbody > tr td:first-child").as("itemNames");

    cy.get("@itemNames")
      .eq(0)
      .should("contain", "Universe")
      .get("@itemNames")
      .eq(1)
      .should("contain", "Mat The Great!")
      .get("@itemNames")
      .eq(2)
      .should("contain", "Go Team");
  });

  it("allows users to filter repositories", () => {
    cy.get('.page-body-content input[type="text"]').as("filterTextbox");
    cy.get("table.table > tbody > tr td:first-child").as("itemNames");

    cy.get("@filterTextbox").type("universe");
    cy.get("@itemNames").should(($itemNames) => {
      expect($itemNames.length).to.equal(1);
      expect($itemNames.eq(0)).to.contain("Universe");
    });
  });

  it("displays 'No data' when it has filtered out all packages", () => {
    cy.get('.page-body-content input[type="text"]').as("filterTextbox");
    cy.get("table.table > tbody > tr").as("tableRows");
    cy.get("@tableRows").get("td").as("tableRowCell");

    cy.get("@filterTextbox").type("foo_bar_baz_qux");

    cy.get("@tableRowCell").should(($tableCell) => {
      expect($tableCell[0].textContent).to.equal("No data");
    });
  });

  it("displays uninstall modal when uninstall is clicked and closes the modal when delete button is clicked", () => {
    cy.get(".button.button-danger-link")
      .eq(0)
      .invoke("show")
      .click({ force: true });
    cy.get(".modal .modal-footer .button.button-danger")
      .should("contain", "Delete Repository")
      .click();
    cy.get(".modal").should("not.exist");
    cy.get("table");
  });
});
