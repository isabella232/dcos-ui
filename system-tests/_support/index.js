require("./formChildCommands");
/**
 * Visit the specified (Routed) URL
 *
 * This function will automatically inject the authentication cookies from the
 * environment variables and visit the correct cluster URL.
 *
 * @param {String} visitUrl - The URL to visit
 */
Cypress.Commands.add("visitUrl", { prevSubject: false }, (visitUrl) => {
  const domain = new URL(Cypress.env("CLUSTER_URL")).host.split(":")[0];
  const url = Cypress.env("CLUSTER_URL") + "/#" + visitUrl;

  cy.setCookie("dcos-acs-auth-cookie", Cypress.env("CLUSTER_AUTH_TOKEN"), {
    httpOnly: true,
    domain,
  })
    .setCookie("dcos-acs-info-cookie", Cypress.env("CLUSTER_AUTH_INFO"), {
      domain,
    })
    .visit(url);
});
/**
 * Checks that a service id abides by format: /<test-UUID>/service-name
 *
 * @param {String} id - serviceId to validate
 *
 */
function validateServiceId(id) {
  if (!id.startsWith("/")) {
    throw new Error("Must include leading slash in service id");
  }
  const idParts = id.split("/");
  if (idParts[1] !== Cypress.env("TEST_UUID")) {
    throw new Error("Service must be in the TEST_UUID group");
  }
  if (idParts.length !== 3) {
    throw new Error("Must deploy service directly in TEST_UUID group");
  }
}

/**
 * Launches a new service using the dcos CLI. Service must be created
 * directly in the TEST_UUID group. Ex: /<TEST-UUID>/test-service
 *
 * @param {Object} serviceDefinition - The service JSON definition file
 *
 */
Cypress.Commands.add("createService", (serviceDefinition) => {
  validateServiceId(serviceDefinition.id);
  const serviceName = serviceDefinition.id.split("/").pop();

  cy.exec(
    `echo '${JSON.stringify(serviceDefinition)}' | dcos marathon app add`
  );
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy.get(".page-body-content .service-table").contains(serviceName);
  cy.get(".page-body-content .service-table").contains("Running");
});

Cypress.Commands.add("retype", { prevSubject: true }, (subject, text) =>
  // we have some weird ceremony in front, so our dsl-filter plays nice.
  cy.wrap(subject).type(` {selectall} {backspace}${text}`)
);

/**
 * Deletes a service from group TEST_UUID using the dcos CLI.
 *
 * @param {String} serviceId - The service id which it will delete
 *
 */
Cypress.Commands.add("deleteService", (serviceId) => {
  validateServiceId(serviceId);
  const serviceName = serviceId.split("/").pop();

  cy.exec(`dcos marathon app remove ${serviceId}`);
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy.get(".page-body-content").contains(serviceName).should("not.exist");
});
