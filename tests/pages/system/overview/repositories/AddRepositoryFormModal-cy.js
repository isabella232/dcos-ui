describe("Add Repository Form Modal", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true,
    })
      .visitUrl({ url: "/settings/repositories" })
      .get(".page-header-actions button")
      .click();
  });

  it("displays modal for adding repository", () => {
    cy.get(".modal h2").should("contain", "Add Repository");
  });

  it("displays three fields", () => {
    cy.get(".modal input").should("have.length", 3);
  });

  it("displays error if both fields aren't filled out", () => {
    cy.get(".modal .modal-footer .button.button-primary")
      .contains("Add")
      .click();

    cy.get(".modal .form-control-feedback")
      .eq(0)
      .should("contain", "Field cannot be empty.");

    cy.get(".modal .form-control-feedback")
      .eq(1)
      .should("contain", "Field cannot be empty.");
  });

  it("closes modal after add is successful", () => {
    cy.get(".modal input")
      .eq(0)
      .type("Here we go!")
      .get(".modal input")
      .eq(1)
      .type("http://there-is-no-stopping.us")
      .get(".modal input")
      .eq(2)
      .type("0")
      .get(".modal .modal-footer .button.button-primary")
      .contains("Add")
      .click();

    cy.get(".modal").should("not.exist");
  });

  it("displays error in modal after add causes an error", () => {
    // We need to add a fixture for this test to pass.
    const url = "http://there-is-no-stopping.us";
    cy.route({
      method: "POST",
      url: /repository\/add/,
      status: 409,
      response: {
        message: "Conflict with " + url,
      },
    })
      .get(".modal input")
      .eq(0)
      .type("Here we go!")
      .get(".modal input")
      .eq(1)
      .type(url)
      .get(".modal input")
      .eq(2)
      .type("0");
    cy.get(".modal .modal-footer .button.button-primary")
      .contains("Add")
      .click();

    cy.get(".modal h4.text-danger").should("contain", url);
  });

  // TODO: Turn into unit test
  it("displays generic error in modal if no message is provided", () => {
    cy.route({
      method: "POST",
      url: /repository\/add/,
      status: 400,
      response: {},
    })
      .get(".modal input")
      .eq(0)
      .type("Here we go!");
    cy.get(".modal input")
      .eq(1)
      .type("http://there-is-no-stopping.us")
      .get(".modal input")
      .eq(2)
      .type("0");
    cy.get(".modal .modal-footer .button.button-primary")
      .contains("Add")
      .click();

    cy.get(".modal h4.text-danger").should("contain", "An error has occurred");
  });
});
