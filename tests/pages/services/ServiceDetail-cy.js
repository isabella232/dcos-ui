describe("Service Detail Page", () => {
  context("Services", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true,
      });
    });

    context("Navigate to service page", () => {
      it("shows the Page Not Found alert panel", () => {
        cy.visitUrl({
          url: "/services/non-existing-service",
        });
        cy.get(".page-body-content").contains("Page not found");
      });
    });

    context("Navigate to service detail page", () => {
      it("shows the Service Not Found alert panel in page contents", () => {
        cy.visitUrl({
          url: "/services/detail/non-existing-service",
        });
        cy.get(".page-body-content").contains("Service not found");
      });

      it("shows instances tab per default", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep",
        });

        cy.get(".menu-tabbed-item .active")
          .contains("Tasks")
          .get(".table")
          .contains("sleep");

        cy.hash().should("match", /services\/detail\/%2Fsleep\/tasks.*/);
      });

      it("shows configuration tab when clicked", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep",
        });

        cy.get(".menu-tabbed-item").contains("Configuration").click();

        cy.get(".menu-tabbed-item .active")
          .contains("Configuration")
          .get(".configuration-map");

        cy.hash().should(
          "match",
          /services\/detail\/%2Fsleep\/configuration.*/
        );
      });

      it("shows debug tab when clicked", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep",
        });

        cy.get(".menu-tabbed-item").contains("Debug").click();

        cy.get(".menu-tabbed-item .active")
          .contains("Debug")
          .get(".page-body-content")
          .contains("Last Changes");
        cy.contains(
          "Offers will appear here when your service is deploying or waiting for resources."
        ); // when we have no resource offes

        cy.hash().should("match", /services\/detail\/%2Fsleep\/debug.*/);
      });

      it("shows endpoints tab when clicked", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep",
        });

        cy.get(".menu-tabbed-item").contains("Endpoints").click();

        cy.get("h1.configuration-map-heading").contains("124");

        cy.get(".table-row")
          .eq(0)
          .should("contain", "Protocol")
          .and("contain", "tcp");

        cy.get(".table-row")
          .eq(1)
          .should("contain", "Container Port")
          .and("contain", "—");

        cy.get(".table-row")
          .eq(2)
          .should("contain", "Host Port")
          .and("contain", "Auto Assigned");

        cy.get(".table-row")
          .eq(3)
          .should("contain", "Load Balanced Address")
          .and("contain", "new-service-1.marathon.l4lb.thisdcos.directory:126");

        cy.get("h1.configuration-map-heading").contains("Web Endpoints");

        cy.get(".table-row")
          .eq(4)
          .should("contain", "Web URL")
          .and("contain", "http://localhost:4200/service/undefined/web-path");

        cy.get("h1.configuration-map-heading").contains("Mesos DNS");
        cy.get(".table-row")
          .eq(5)
          .should("contain", "marathon")
          .and("contain", "sleep.marathon.mesos");
      });

      it("shows volumes tab when clicked", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fsleep",
        });

        cy.get(".menu-tabbed-item").contains("Volumes").click();

        cy.get(".menu-tabbed-item .active").contains("Volumes");

        cy.get(".table")
          .contains("tr", "volume-1")
          .parents(".table")
          .contains("tr", "volume-2");

        cy.hash().should("match", /services\/detail\/%2Fsleep\/volumes.*/);
      });
    });

    context("Filter Tasks", () => {
      const DEFAULT_ROWS = 1; // Headline
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true,
        });

        cy.visitUrl({
          url: "/services/detail/%2Fsleep/tasks",
        });
      });

      it("starts with no filters", () => {
        cy.get(".table tr").should("have.length", DEFAULT_ROWS + 3);
      });

      it("can filter tasks by status", () => {
        cy.get('use[*|href$="#system-funnel"]').click({
          force: true,
        });

        // Disable active
        cy.contains("Active").click({ force: true });

        // Enable completed
        cy.contains("Completed").click({ force: true });

        // Wait a moment to check it doesn't flip back
        cy.wait(500);

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr.inactive").should("have.length", 22);
      });

      it("can filter tasks by name", () => {
        cy.get('use[*|href$="#system-funnel"]').click({
          force: true,
        });

        // Disable active
        cy.contains("Active").click({ force: true });

        cy.get(".dsl-form-group input[name='text']").type(
          "sleep.instance-7084272b-6b76-11e5-a953-08002719334c._app.1"
        );

        // Wait a moment to check it doesn't flip back
        cy.wait(500);

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr").should("have.length", DEFAULT_ROWS + 1);
      });

      it("can filter tasks by zone", () => {
        // wait for zones to load
        cy.wait(2500);

        cy.get('use[*|href$="#system-funnel"]').click({
          force: true,
        });
        // Enable zone
        cy.contains("ap-northeast-1a").click({ force: true });

        // Apply filter
        cy.contains("Apply").click({ force: true });

        cy.get(".table tr").should("have.length", DEFAULT_ROWS + 1);
      });

      it("can filter by typing a filter", () => {
        cy.get(".filter-input-text").focus().retype("region:ap-northeast-1");
        cy.get(".table tr").should("have.length", DEFAULT_ROWS + 1);
      });
    });
  });

  context("SDK Services", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
        universePackages: true,
      });
    });

    context("Configuration Tab", () => {
      it("shows configuration of a service", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fcassandra-healthy/configuration",
        });
        cy.get("h1").contains("Service");
        cy.get("h1").contains("Elasticsearch");
        cy.get("h1").contains("Master Nodes");
        cy.get("h1").contains("Data Nodes");
        cy.get("h1").contains("Ingest Nodes");
        cy.get("h1").contains("Coordinator Nodes");
      });

      it("handles network errors", () => {
        cy.visitUrl({
          url: "/services/detail/%2Fcassandra-healthy/configuration",
        });
        cy.route({
          method: "POST",
          url: /cosmos\/service\/describe(\?_timestamp=[0-9]+)?$/,
          status: 400,
          response: {
            message: "Version doesn't exists",
          },
        }).as("cosmosDescribe");

        cy.wait("@cosmosDescribe");

        cy.get(".page-body").contains("Version doesn't exists");
      });
    });

    it("edit config button opens the edit flow", () => {
      cy.visitUrl({
        url: "/services/detail/%2Fcassandra-healthy/configuration",
      });

      cy.get(".container").contains("Edit Config").click();

      cy.location()
        .its("hash")
        .should("include", "#/services/detail/%2Fcassandra-healthy/edit");
    });

    it("download button exists", () => {
      cy.visitUrl({
        url: "/services/detail/%2Fcassandra-healthy/configuration",
      });

      cy.get(".container").contains("Download Config");
    });
  });

  context("Delayed service", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-delayed",
        nodeHealth: true,
      });
    });

    it("shows debug tab when clicked", () => {
      cy.visitUrl({
        url: "/services/detail/%2Fsleep",
      });

      cy.get(".menu-tabbed-item").contains("Debug").click();

      cy.get(".menu-tabbed-item .active")
        .contains("Debug")
        .get(".page-body-content")
        .contains("Last Changes");
      cy.contains(
        "DC/OS has delayed the launching of this service due to failures."
      );
      cy.get("a").contains("More information").should("have.attr", "href");
      cy.get("a").contains("Retry now").click();
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/queue\/\/sleep\/delay/,
        response: [],
      });
      cy.get(".toasts-container");
      cy.hash().should("match", /services\/detail\/%2Fsleep\/debug.*/);
    });
  });

  context("Actions", () => {
    function openDropdown() {
      cy.get(".button-narrow").click();
    }

    function clickDropdownAction(actionText) {
      cy.get(".dropdown-menu-items").contains(actionText).click();
    }

    context("Reset Delay Action", () => {
      context("Delayed service", () => {
        beforeEach(() => {
          cy.configureCluster({
            mesos: "1-task-delayed",
            nodeHealth: true,
          });
          cy.visitUrl({
            url: "/services/detail/%2Fsleep",
          });
          openDropdown("sleep");
          clickDropdownAction("Reset Delay");
        });

        it("shows a toast notification", () => {
          cy.route({
            method: "DELETE",
            url: /marathon\/v2\/queue\/\/sleep\/delay/,
            response: [],
          });
          cy.get(".toasts-container");
        });
      });

      context("Non-delayed service", () => {
        beforeEach(() => {
          cy.configureCluster({
            mesos: "1-task-healthy",
            nodeHealth: true,
          });
          cy.visitUrl({
            url: "/services/detail/%2Fsleep",
          });
          openDropdown("sleep");
        });

        it("doesn't have a reset delayed action", () => {
          cy.get(".dropdown-menu-items")
            .contains("Reset Delay")
            .should("not.exist");
        });
      });
    });
  });
});
